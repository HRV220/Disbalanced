using System.Collections.Concurrent;
using System.Diagnostics;
using System.Threading.Channels;
using System.Threading.RateLimiting;
using APIBricks.CoinAPI.MarketDataAPI.REST.V1.Api;
using CoinService.Configuration;
using CoinService.Data;
using CoinService.HealthChecks;
using CoinService.Helpers;
using CoinService.Models;
using CoinService.Services;
using EFCore.BulkExtensions;
using Microsoft.Extensions.Options;

namespace CoinService.Worker;

public class DataCollector : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DataCollector> _logger;
    private readonly DataCollectorOptions _options;
    private readonly IMetadataApi _metadataApi;
    private readonly IOrderBookApi _orderBookApi;
    private readonly IOhlcvApi _ohlcvApi;
    private readonly RateLimiter _rateLimiter;
    private readonly AggregationService _aggregationService;

    private readonly Channel<MarketMetric> _metricsChannel;
    private readonly Channel<Candle> _candlesChannel;

    private List<SymbolInfo> _targetSymbols = new();
    private DateTime _lastSymbolsRefresh = DateTime.MinValue;

    public DataCollector(
        IServiceProvider serviceProvider,
        ILogger<DataCollector> logger,
        IMetadataApi metadataApi,
        IOrderBookApi orderBookApi,
        IOhlcvApi ohlcvApi,
        IOptions<DataCollectorOptions> options,
        RateLimiter rateLimiter,
        AggregationService aggregationService)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _metadataApi = metadataApi;
        _orderBookApi = orderBookApi;
        _ohlcvApi = ohlcvApi;
        _options = options.Value;
        _rateLimiter = rateLimiter;
        _aggregationService = aggregationService;

        _metricsChannel = Channel.CreateBounded<MarketMetric>(new BoundedChannelOptions(5000)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = true
        });

        _candlesChannel = Channel.CreateBounded<Candle>(new BoundedChannelOptions(5000)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = true
        });
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DataCollector starting...");

        await InitializeSymbolsAsync(stoppingToken);

        if (_targetSymbols.Count == 0)
        {
            _logger.LogWarning("No symbols found. DataCollector stopping.");
            return;
        }

        _logger.LogInformation("Initialized {Count} symbols", _targetSymbols.Count);

        // Запускаем consumers для обоих каналов
        var metricsConsumerTask = RunMetricsConsumerAsync(stoppingToken);
        var candlesConsumerTask = RunCandlesConsumerAsync(stoppingToken);

        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(_options.CollectionIntervalMinutes));

        // Первый цикл сразу
        await CollectCycleAsync(stoppingToken);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await CollectCycleAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in collection cycle");
            }
        }

        _metricsChannel.Writer.Complete();
        _candlesChannel.Writer.Complete();

        await Task.WhenAll(metricsConsumerTask, candlesConsumerTask);
    }

    private async Task CollectCycleAsync(CancellationToken ct)
    {
        var stopwatch = Stopwatch.StartNew();
        var timestamp = DateTime.UtcNow;

        var metricsCount = 0;
        var candlesCount = 0;
        var errorCount = 0;

        var collectedMetrics = new ConcurrentBag<MarketMetric>();

        await Parallel.ForEachAsync(
            _targetSymbols,
            new ParallelOptions
            {
                MaxDegreeOfParallelism = _options.MaxDegreeOfParallelism,
                CancellationToken = ct
            },
            async (symbolInfo, token) =>
            {
                // Собираем OrderBook
                var orderBookSuccess = await CollectOrderBookAsync(symbolInfo, timestamp, collectedMetrics, token);
                if (orderBookSuccess) Interlocked.Increment(ref metricsCount);

                // Собираем свечи (параллельно, используя тот же rate limiter)
                var candleSuccess = await CollectCandleAsync(symbolInfo, token);
                if (candleSuccess) Interlocked.Increment(ref candlesCount);

                if (!orderBookSuccess && !candleSuccess)
                    Interlocked.Increment(ref errorCount);
            });

        // Сохраняем агрегаты после сбора всех метрик
        if (collectedMetrics.Count > 0)
        {
            await CalculateAndSaveAggregatesAsync(collectedMetrics.ToList(), timestamp, ct);
        }

        // Обновляем статус для health check
        DataCollectorHealthCheck.ReportSuccess(metricsCount);

        _logger.LogInformation(
            "Cycle completed: {Metrics} metrics, {Candles} candles in {Elapsed:F1}s, errors: {Errors}",
            metricsCount, candlesCount, stopwatch.Elapsed.TotalSeconds, errorCount);
    }

    private async Task<bool> CollectOrderBookAsync(
        SymbolInfo symbolInfo,
        DateTime timestamp,
        ConcurrentBag<MarketMetric> collectedMetrics,
        CancellationToken ct)
    {
        using var lease = await _rateLimiter.AcquireAsync(1, ct);
        if (!lease.IsAcquired) return false;

        try
        {
            var response = await _orderBookApi.V1OrderbooksSymbolIdCurrentGetAsync(
                symbolInfo.SymbolId,
                limitLevels: _options.OrderBookLimitLevels,
                cancellationToken: ct);

            if (!response.IsOk || response.Ok() == null)
                return false;

            using var scope = _serviceProvider.CreateScope();
            var calculator = scope.ServiceProvider.GetRequiredService<OrderBookCalculator>();

            var metric = calculator.Calculate(symbolInfo.SymbolId, response.Ok()!, timestamp);

            if (metric != null)
            {
                metric.ExchangeId = symbolInfo.ExchangeId;
                metric.MarketType = symbolInfo.MarketType;
                metric.BaseAsset = symbolInfo.BaseAsset;
                metric.QuoteAsset = symbolInfo.QuoteAsset;

                await _metricsChannel.Writer.WriteAsync(metric, ct);
                collectedMetrics.Add(metric);
                return true;
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Error collecting order book for {Symbol}", symbolInfo.SymbolId);
        }

        return false;
    }

    private async Task<bool> CollectCandleAsync(SymbolInfo symbolInfo, CancellationToken ct)
    {
        using var lease = await _rateLimiter.AcquireAsync(1, ct);
        if (!lease.IsAcquired) return false;

        try
        {
            // Запрашиваем последние 1MIN свечи
            var response = await _ohlcvApi.V1OhlcvSymbolIdLatestGetAsync(
                symbolId: symbolInfo.SymbolId,
                periodId: "1MIN",
                limit: 1,
                cancellationToken: ct);

            if (!response.IsOk)
                return false;

            var data = response.Ok();
            if (data == null || data.Count == 0)
                return false;

            var ohlcv = data[0];

            if (!ohlcv.TimePeriodStart.HasValue)
                return false;

            var candle = new Candle
            {
                Time = ohlcv.TimePeriodStart.Value,
                Symbol = symbolInfo.SymbolId,
                Period = "1MIN",
                ExchangeId = symbolInfo.ExchangeId,
                BaseAsset = symbolInfo.BaseAsset,
                QuoteAsset = symbolInfo.QuoteAsset,
                Open = (decimal)(ohlcv.PriceOpen ?? 0),
                High = (decimal)(ohlcv.PriceHigh ?? 0),
                Low = (decimal)(ohlcv.PriceLow ?? 0),
                Close = (decimal)(ohlcv.PriceClose ?? 0),
                Volume = (decimal)(ohlcv.VolumeTraded ?? 0),
                TradesCount = (int)(ohlcv.TradesCount ?? 0)
            };

            await _candlesChannel.Writer.WriteAsync(candle, ct);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Error collecting candle for {Symbol}", symbolInfo.SymbolId);
        }

        return false;
    }

    #region Consumers

    private async Task RunMetricsConsumerAsync(CancellationToken ct)
    {
        var batch = new List<MarketMetric>(_options.BatchSize);

        try
        {
            await foreach (var metric in _metricsChannel.Reader.ReadAllAsync(ct))
            {
                batch.Add(metric);

                if (batch.Count >= _options.BatchSize || _metricsChannel.Reader.Count == 0)
                {
                    await SaveMetricsBatchAsync(batch, ct);
                    batch.Clear();
                }
            }

            if (batch.Count > 0)
                await SaveMetricsBatchAsync(batch, ct);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            if (batch.Count > 0)
                await SaveMetricsBatchAsync(batch, CancellationToken.None);
        }
    }

    private async Task RunCandlesConsumerAsync(CancellationToken ct)
    {
        var batch = new List<Candle>(_options.BatchSize);

        try
        {
            await foreach (var candle in _candlesChannel.Reader.ReadAllAsync(ct))
            {
                batch.Add(candle);

                if (batch.Count >= _options.BatchSize || _candlesChannel.Reader.Count == 0)
                {
                    await SaveCandlesBatchAsync(batch, ct);
                    batch.Clear();
                }
            }

            if (batch.Count > 0)
                await SaveCandlesBatchAsync(batch, ct);
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            if (batch.Count > 0)
                await SaveCandlesBatchAsync(batch, CancellationToken.None);
        }
    }

    #endregion

    #region Save Methods

    private async Task SaveMetricsBatchAsync(List<MarketMetric> metrics, CancellationToken ct)
    {
        if (metrics.Count == 0) return;

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.ChangeTracker.AutoDetectChangesEnabled = false;
            await db.BulkInsertOrUpdateAsync(metrics, cancellationToken: ct);
            _logger.LogDebug("Saved {Count} metrics", metrics.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving {Count} metrics", metrics.Count);
        }
    }

    private async Task SaveCandlesBatchAsync(List<Candle> candles, CancellationToken ct)
    {
        if (candles.Count == 0) return;

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.ChangeTracker.AutoDetectChangesEnabled = false;
            await db.BulkInsertOrUpdateAsync(candles, cancellationToken: ct);
            _logger.LogDebug("Saved {Count} candles", candles.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving {Count} candles", candles.Count);
        }
    }

    private async Task CalculateAndSaveAggregatesAsync(
        List<MarketMetric> metrics,
        DateTime timestamp,
        CancellationToken ct)
    {
        try
        {
            var groups = metrics.GroupBy(m => (m.ExchangeId, m.MarketType));
            var allAggregates = new List<AggregatedMetric>();

            foreach (var group in groups)
            {
                var aggregates = _aggregationService.CalculateAggregates(
                    group.ToList(), timestamp, group.Key.ExchangeId, group.Key.MarketType);
                allAggregates.AddRange(aggregates);
            }

            if (allAggregates.Count > 0)
            {
                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.ChangeTracker.AutoDetectChangesEnabled = false;
                await db.BulkInsertOrUpdateAsync(allAggregates, cancellationToken: ct);
                _logger.LogDebug("Saved {Count} aggregates", allAggregates.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving aggregates");
        }
    }

    #endregion

    #region Initialization

    private async Task InitializeSymbolsAsync(CancellationToken ct)
    {
        var uniqueExchanges = _options.Exchanges.Distinct().ToList();

        _logger.LogInformation("Loading symbols for exchanges: {Exchanges}",
            string.Join(", ", uniqueExchanges));

        var allSymbols = new List<SymbolInfo>();

        foreach (var exchange in uniqueExchanges)
        {
            try
            {
                var filterSymbolId = $"{exchange}_SPOT_";

                var response = await _metadataApi.V1SymbolsExchangeIdActiveGetAsync(
                    exchange,
                    filterSymbolId: filterSymbolId,
                    cancellationToken: ct);

                if (response.IsOk && response.Ok() != null)
                {
                    var filtered = SymbolFilterHelper.FilterSymbols(response.Ok()!, _options);
                    var newSymbols = filtered
                        .Where(s => !allSymbols.Any(existing => existing.SymbolId == s.SymbolId))
                        .DistinctBy(s => s.SymbolId)
                        .ToList();

                    allSymbols.AddRange(newSymbols);

                    _logger.LogInformation(
                        "Exchange {Exchange}: found {Count} symbols (from {Total} total)",
                        exchange, filtered.Count, response.Ok()!.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading symbols for {Exchange}", exchange);
            }
        }

        _targetSymbols = allSymbols;
        _lastSymbolsRefresh = DateTime.UtcNow;
    }

    #endregion
}