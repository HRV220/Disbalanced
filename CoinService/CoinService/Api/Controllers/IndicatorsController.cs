using CoinService.Api.Dto;
using CoinService.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoinService.Api.Controllers;

[ApiController]
[Route("api/indicators")]
public class IndicatorsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<IndicatorsController> _logger;

    // Допустимые категории
    private static readonly HashSet<string> ValidCategories = new(StringComparer.OrdinalIgnoreCase)
    {
        "COIN", "TOTAL", "TOTAL1", "TOTAL2", "TOTAL3", "OTHERS"
    };

    // Допустимые разрешения (минуты, кроме D = 1440)
    private static readonly Dictionary<string, int> ResolutionMinutes = new(StringComparer.OrdinalIgnoreCase)
    {
        { "1", 1 },
        { "5", 5 },
        { "15", 15 },
        { "30", 30 },
        { "60", 60 },
        { "240", 240 },
        { "D", 1440 }
    };

    public IndicatorsController(AppDbContext db, ILogger<IndicatorsController> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Получить индикаторы глубины стакана
    /// </summary>
    /// <param name="symbol">Торговая пара (BTCUSDT) или категория</param>
    /// <param name="category">COIN, TOTAL, TOTAL1, TOTAL2, TOTAL3, OTHERS</param>
    /// <param name="resolution">1, 5, 15, 30, 60, 240, D</param>
    /// <param name="from">Unix timestamp (секунды)</param>
    /// <param name="to">Unix timestamp (секунды)</param>
    [HttpGet("depth")]
    public async Task<ActionResult<DepthIndicatorResponse>> GetDepth(
        [FromQuery] string symbol,
        [FromQuery] string category,
        [FromQuery] string resolution,
        [FromQuery] long from,
        [FromQuery] long to)
    {
        // Валидация параметров
        if (string.IsNullOrWhiteSpace(symbol))
            return BadRequest(new { error = "symbol is required" });

        if (string.IsNullOrWhiteSpace(category) || !ValidCategories.Contains(category))
            return BadRequest(new { error = "category must be one of: COIN, TOTAL, TOTAL1, TOTAL2, TOTAL3, OTHERS" });

        if (!ResolutionMinutes.TryGetValue(resolution ?? "1", out var resolutionMins))
            return BadRequest(new { error = "resolution must be one of: 1, 5, 15, 30, 60, 240, D" });

        if (from <= 0 || to <= 0 || from >= to)
            return BadRequest(new { error = "Invalid time range" });

        // Конвертируем Unix timestamp в DateTime
        var fromDate = DateTimeOffset.FromUnixTimeSeconds(from).UtcDateTime;
        var toDate = DateTimeOffset.FromUnixTimeSeconds(to).UtcDateTime;

        // Ограничение диапазона (макс 90 дней)
        if ((toDate - fromDate).TotalDays > 90)
            return BadRequest(new { error = "Time range cannot exceed 90 days" });

        try
        {
            List<DepthPoint> points;

            if (category.Equals("COIN", StringComparison.OrdinalIgnoreCase))
            {
                // Для конкретной монеты — берём из market_metrics
                points = await GetCoinDepthAsync(symbol, fromDate, toDate, resolutionMins);
            }
            else
            {
                // Для категорий TOTAL, TOTAL1... — берём из aggregated_metrics
                points = await GetAggregatedDepthAsync(category, fromDate, toDate, resolutionMins);
            }

            return Ok(new DepthIndicatorResponse
            {
                Symbol = symbol,
                Category = category.ToUpper(),
                Points = points
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting depth for {Symbol}/{Category}", symbol, category);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Получить данные глубины для конкретной монеты
    /// </summary>
    private async Task<List<DepthPoint>> GetCoinDepthAsync(
        string symbol,
        DateTime from,
        DateTime to,
        int resolutionMinutes)
    {
        // Преобразуем символ BTCUSDT -> поиск по BaseAsset+QuoteAsset или по полному SymbolId
        // Формат CoinAPI: BINANCE_SPOT_BTC_USDT

        var query = _db.Metrics
            .Where(m => m.Time >= from && m.Time <= to)
            .Where(m =>
                // Ищем по комбинации base+quote (BTCUSDT -> BTC + USDT)
                (m.BaseAsset + m.QuoteAsset) == symbol.ToUpper() ||
                // Или по полному symbol_id содержащему символ
                m.Symbol.Contains(symbol.ToUpper()))
            .OrderBy(m => m.Time);

        List<MarketMetric> data;

        if (resolutionMinutes == 1)
        {
            // Без агрегации — возвращаем как есть
            data = await query.ToListAsync();
        }
        else
        {
            // Агрегация по временным интервалам с использованием TimescaleDB time_bucket
            // Для простоты делаем in-memory агрегацию (для больших данных лучше SQL)
            var rawData = await query.ToListAsync();
            data = AggregateByResolution(rawData, resolutionMinutes);
        }

        return data.Select(m => new DepthPoint
        {
            Time = new DateTimeOffset(m.Time, TimeSpan.Zero).ToUnixTimeMilliseconds(),
            Bid_1_5 = m.BidVolume_1_5,
            Bid_3 = m.BidVolume_3,
            Bid_5 = m.BidVolume_5,
            Bid_8 = m.BidVolume_8,
            Bid_15 = m.BidVolume_15,
            Bid_30 = m.BidVolume_30,
            Ask_1_5 = m.AskVolume_1_5,
            Ask_3 = m.AskVolume_3,
            Ask_5 = m.AskVolume_5,
            Ask_8 = m.AskVolume_8,
            Ask_15 = m.AskVolume_15,
            Ask_30 = m.AskVolume_30
        }).ToList();
    }

    /// <summary>
    /// Получить агрегированные данные для категорий TOTAL, TOTAL1...
    /// </summary>
    private async Task<List<DepthPoint>> GetAggregatedDepthAsync(
        string category,
        DateTime from,
        DateTime to,
        int resolutionMinutes)
    {
        var query = _db.AggregatedMetrics
            .Where(m => m.Time >= from && m.Time <= to)
            .Where(m => m.Category == category.ToUpper())
            .OrderBy(m => m.Time);

        List<AggregatedMetric> data;

        if (resolutionMinutes == 1)
        {
            data = await query.ToListAsync();
        }
        else
        {
            var rawData = await query.ToListAsync();
            data = AggregateByResolution(rawData, resolutionMinutes);
        }

        return data.Select(m => new DepthPoint
        {
            Time = new DateTimeOffset(m.Time, TimeSpan.Zero).ToUnixTimeMilliseconds(),
            Bid_1_5 = m.BidVolume_1_5,
            Bid_3 = m.BidVolume_3,
            Bid_5 = m.BidVolume_5,
            Bid_8 = m.BidVolume_8,
            Bid_15 = m.BidVolume_15,
            Bid_30 = m.BidVolume_30,
            Ask_1_5 = m.AskVolume_1_5,
            Ask_3 = m.AskVolume_3,
            Ask_5 = m.AskVolume_5,
            Ask_8 = m.AskVolume_8,
            Ask_15 = m.AskVolume_15,
            Ask_30 = m.AskVolume_30
        }).ToList();
    }

    /// <summary>
    /// Агрегация MarketMetric по временным интервалам (среднее)
    /// </summary>
    private List<MarketMetric> AggregateByResolution(List<MarketMetric> data, int resolutionMinutes)
    {
        return data
            .GroupBy(m => new DateTime(
                m.Time.Year, m.Time.Month, m.Time.Day,
                m.Time.Hour, (m.Time.Minute / resolutionMinutes) * resolutionMinutes, 0, DateTimeKind.Utc))
            .Select(g => new MarketMetric
            {
                Time = g.Key,
                Symbol = g.First().Symbol,
                BidVolume_1_5 = g.Average(x => x.BidVolume_1_5),
                AskVolume_1_5 = g.Average(x => x.AskVolume_1_5),
                BidVolume_3 = g.Average(x => x.BidVolume_3),
                AskVolume_3 = g.Average(x => x.AskVolume_3),
                BidVolume_5 = g.Average(x => x.BidVolume_5),
                AskVolume_5 = g.Average(x => x.AskVolume_5),
                BidVolume_8 = g.Average(x => x.BidVolume_8),
                AskVolume_8 = g.Average(x => x.AskVolume_8),
                BidVolume_15 = g.Average(x => x.BidVolume_15),
                AskVolume_15 = g.Average(x => x.AskVolume_15),
                BidVolume_30 = g.Average(x => x.BidVolume_30),
                AskVolume_30 = g.Average(x => x.AskVolume_30)
            })
            .OrderBy(m => m.Time)
            .ToList();
    }

    /// <summary>
    /// Агрегация AggregatedMetric по временным интервалам (среднее)
    /// </summary>
    private List<AggregatedMetric> AggregateByResolution(List<AggregatedMetric> data, int resolutionMinutes)
    {
        return data
            .GroupBy(m => new DateTime(
                m.Time.Year, m.Time.Month, m.Time.Day,
                m.Time.Hour, (m.Time.Minute / resolutionMinutes) * resolutionMinutes, 0, DateTimeKind.Utc))
            .Select(g => new AggregatedMetric
            {
                Time = g.Key,
                Category = g.First().Category,
                BidVolume_1_5 = g.Average(x => x.BidVolume_1_5),
                AskVolume_1_5 = g.Average(x => x.AskVolume_1_5),
                BidVolume_3 = g.Average(x => x.BidVolume_3),
                AskVolume_3 = g.Average(x => x.AskVolume_3),
                BidVolume_5 = g.Average(x => x.BidVolume_5),
                AskVolume_5 = g.Average(x => x.AskVolume_5),
                BidVolume_8 = g.Average(x => x.BidVolume_8),
                AskVolume_8 = g.Average(x => x.AskVolume_8),
                BidVolume_15 = g.Average(x => x.BidVolume_15),
                AskVolume_15 = g.Average(x => x.AskVolume_15),
                BidVolume_30 = g.Average(x => x.BidVolume_30),
                AskVolume_30 = g.Average(x => x.AskVolume_30)
            })
            .OrderBy(m => m.Time)
            .ToList();
    }

    /// <summary>
    /// Получить данные по funding rate (заглушка)
    /// </summary>
    [HttpGet("funding")]
    public ActionResult<FundingResponse> GetFunding(
        [FromQuery] string symbol,
        [FromQuery] long from,
        [FromQuery] long to)
    {
        // TODO: Реализовать после добавления сбора funding rates
        return Ok(new FundingResponse
        {
            Points = new List<FundingPoint>()
        });
    }
}