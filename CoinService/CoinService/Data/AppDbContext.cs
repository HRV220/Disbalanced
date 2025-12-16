using Microsoft.EntityFrameworkCore;

namespace CoinService.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<MarketMetric> Metrics { get; set; }
    public DbSet<AggregatedMetric> AggregatedMetrics { get; set; }
    public DbSet<Candle> Candles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // MarketMetric
        modelBuilder.Entity<MarketMetric>(entity =>
        {
            entity.ToTable("market_metrics");
            entity.HasKey(m => new { m.Time, m.Symbol });
            entity.HasIndex(m => new { m.ExchangeId, m.Time });
            entity.HasIndex(m => new { m.BaseAsset, m.Time });
        });

        // AggregatedMetric
        modelBuilder.Entity<AggregatedMetric>(entity =>
        {
            entity.ToTable("aggregated_metrics");
            entity.HasKey(m => new { m.Time, m.Category, m.ExchangeId, m.MarketType });
            entity.HasIndex(m => new { m.Category, m.Time });
        });

        // Candle
        modelBuilder.Entity<Candle>(entity =>
        {
            entity.ToTable("candles");
            entity.HasKey(c => new { c.Time, c.Symbol, c.Period });
            entity.HasIndex(c => new { c.Symbol, c.Period, c.Time });
            entity.HasIndex(c => new { c.BaseAsset, c.QuoteAsset, c.Period, c.Time });
        });
    }
}
