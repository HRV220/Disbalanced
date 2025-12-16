using System.Threading.RateLimiting;
using APIBricks.CoinAPI.MarketDataAPI.REST.V1.Client;
using APIBricks.CoinAPI.MarketDataAPI.REST.V1.Extensions;
using CoinService.Configuration;
using CoinService.Data;
using CoinService.HealthChecks;
using CoinService.Services;
using CoinService.Worker;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Serilog.Events;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File("logs/coinservice-.log", rollingInterval: RollingInterval.Day, retainedFileCountLimit: 7)
    .CreateLogger();

try
{
    Log.Information("Starting CoinService...");

    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog();

    builder.Services.AddControllers();

    // ============================================
    // CORS Configuration - Allow Frontend Access
    // ============================================
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            // Get allowed origins from configuration or use defaults
            var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                ?? new[] { "http://localhost:3000", "http://frontend:3000" };

            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); // If you need cookies/auth
        });

        // Named policy for more control (optional)
        options.AddPolicy("Development", policy =>
        {
            policy.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
    });

    builder.Services.Configure<DataCollectorOptions>(
        builder.Configuration.GetSection(DataCollectorOptions.SectionName));

    builder.Services.Configure<OrderBookOptions>(
        builder.Configuration.GetSection(OrderBookOptions.SectionName));

    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        options.UseNpgsql(connectionString).UseSnakeCaseNamingConvention();
    });

    builder.Services.AddScoped<OrderBookCalculator>();
    builder.Services.AddSingleton<AggregationService>();

    builder.Services.AddSingleton<RateLimiter>(sp =>
    {
        var config = sp.GetRequiredService<IConfiguration>();
        var rateLimit = config.GetValue<int>("CoinApi:RateLimitPerSecond", 10);
        Log.Information("Configuring RateLimiter: {RateLimit} requests/sec", rateLimit);

        return new SlidingWindowRateLimiter(new SlidingWindowRateLimiterOptions
        {
            PermitLimit = rateLimit,
            Window = TimeSpan.FromSeconds(1),
            SegmentsPerWindow = 4,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 1000
        });
    });

    var apiKey = builder.Configuration["CoinApi:Key"];
    if (string.IsNullOrEmpty(apiKey) || apiKey == "YOUR_COINAPI_KEY")
    {
        throw new InvalidOperationException("CoinAPI Key not configured!");
    }

    builder.Host.ConfigureApi((context, services, config) =>
    {
        var key = context.Configuration["CoinApi:Key"]!;
        config.AddTokens(new ApiKeyToken(key, ClientUtils.ApiKeyHeader.Authorization));
        config.AddTokens(new BearerToken(key));
        config.AddApiHttpClients(client =>
        {
            client.BaseAddress = new Uri("https://rest.coinapi.io");
            client.Timeout = TimeSpan.FromSeconds(60);
        },
        httpBuilder =>
        {
            httpBuilder.AddHttpMessageHandler(() => new CoinApiKeyHandler(key));
            httpBuilder.AddRetryPolicy(3);
        });
    });

    builder.Services.AddHostedService<DataCollector>();

    builder.Services.AddHealthChecks()
        .AddNpgSql(connectionString!, name: "postgres")
        .AddCheck<DataCollectorHealthCheck>("data_collector");

    var app = builder.Build();

    // Database initialization
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Log.Information("Initializing database...");
        await db.Database.EnsureCreatedAsync();

        try
        {
            await db.Database.ExecuteSqlRawAsync(@"
                SELECT create_hypertable('market_metrics', 'time', if_not_exists => TRUE);
                SELECT create_hypertable('aggregated_metrics', 'time', if_not_exists => TRUE);
                SELECT create_hypertable('candles', 'time', if_not_exists => TRUE);
            ");
        }
        catch (Exception ex)
        {
            Log.Warning(ex, "Could not create hypertables (may already exist)");
        }

        try
        {
            await db.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE candles SET (
                    timescaledb.compress,
                    timescaledb.compress_segmentby = 'symbol, period',
                    timescaledb.compress_orderby = 'time DESC'
                );
                SELECT add_compression_policy('candles', INTERVAL '1 day', if_not_exists => true);
            ");
        }
        catch (Exception ex)
        {
            Log.Warning("Candles compression setup: {Message}", ex.Message);
        }

        Log.Information("Database initialized successfully.");
    }

    // ============================================
    // Middleware Pipeline
    // ============================================

    // Enable CORS - MUST be before other middleware that handles requests
    app.UseCors();

    app.UseSerilogRequestLogging();

    app.MapControllers();
    app.MapHealthChecks("/health");

    app.MapGet("/", () => Results.Ok(new { Service = "CoinService", Status = "Running" }));

    app.MapGet("/status", () =>
    {
        var (lastCollection, count) = DataCollectorHealthCheck.GetStatus();
        return Results.Ok(new
        {
            LastCollection = lastCollection,
            SymbolsCollected = count,
            LagSeconds = (DateTime.UtcNow - lastCollection).TotalSeconds
        });
    });

    Log.Information("CoinService started.");
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "CoinService terminated unexpectedly.");
}
finally
{
    Log.CloseAndFlush();
}