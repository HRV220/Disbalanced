using CoinService.Api.Dto;
using CoinService.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoinService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CandlesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<CandlesController> _logger;

    // Маппинг resolution -> минуты для агрегации
    private static readonly Dictionary<string, int> ResolutionMinutes = new(StringComparer.OrdinalIgnoreCase)
    {
        { "1", 1 },
        { "5", 5 },
        { "15", 15 },
        { "30", 30 },
        { "60", 60 },
        { "240", 240 },
        { "D", 1440 },
        { "1D", 1440 }
    };

    public CandlesController(AppDbContext db, ILogger<CandlesController> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Получить исторические свечи для TradingView
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<CandlesResponse>> GetCandles(
        [FromQuery] string symbol,
        [FromQuery] string resolution,
        [FromQuery] long from,
        [FromQuery] long to)
    {
        if (string.IsNullOrWhiteSpace(symbol))
            return BadRequest(new { error = "symbol is required" });

        if (!ResolutionMinutes.TryGetValue(resolution ?? "1", out var resolutionMins))
            return BadRequest(new { error = "resolution must be one of: 1, 5, 15, 30, 60, 240, D" });

        if (from <= 0 || to <= 0 || from >= to)
            return BadRequest(new { error = "Invalid time range" });

        var fromDate = DateTimeOffset.FromUnixTimeSeconds(from).UtcDateTime;
        var toDate = DateTimeOffset.FromUnixTimeSeconds(to).UtcDateTime;

        if ((toDate - fromDate).TotalDays > 365)
            return BadRequest(new { error = "Time range cannot exceed 365 days" });

        try
        {
            var normalizedSymbol = symbol.ToUpper();

            var normalizedSearch = symbol.Replace("_", "").Replace("-", "").Replace("/", "").ToUpper();

            var rawCandles = await _db.Candles
                .Where(c => c.Period == "1MIN")
                .Where(c => c.Time >= fromDate && c.Time <= toDate)
                .Where(c =>
                    c.Symbol == symbol || // Точное совпадение (идеально)
                    (c.BaseAsset + c.QuoteAsset) == normalizedSearch || // BTC + USDT == BTCUSDT
                    c.Symbol.Replace("_", "") == normalizedSearch // BINANCESPOTBTCUSDT == ...
                )
                .OrderBy(c => c.Time)
                .ToListAsync();

            List<CandleDto> result;

            if (resolutionMins == 1)
            {
                // Без агрегации
                result = rawCandles.Select(c => new CandleDto
                {
                    Time = new DateTimeOffset(c.Time, TimeSpan.Zero).ToUnixTimeMilliseconds(),
                    Open = c.Open,
                    High = c.High,
                    Low = c.Low,
                    Close = c.Close,
                    Volume = c.Volume
                }).ToList();
            }
            else
            {
                // Агрегируем 1MIN свечи в нужный таймфрейм
                result = AggregateCandles(rawCandles, resolutionMins);
            }

            return Ok(new CandlesResponse
            {
                Bars = result,
                NoData = result.Count == 0
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting candles for {Symbol}", symbol);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Получить последнюю свечу
    /// </summary>
    [HttpGet("latest")]
    public async Task<ActionResult<CandleDto>> GetLatest(
        [FromQuery] string symbol,
        [FromQuery] string resolution)
    {
        if (string.IsNullOrWhiteSpace(symbol))
            return BadRequest(new { error = "symbol is required" });

        try
        {
            var normalizedSymbol = symbol.ToUpper();

            var candle = await _db.Candles
                .Where(c => c.Period == "1MIN")
                .Where(c =>
                    (c.BaseAsset + c.QuoteAsset) == normalizedSymbol ||
                    c.Symbol.Contains(normalizedSymbol))
                .OrderByDescending(c => c.Time)
                .Select(c => new CandleDto
                {
                    Time = new DateTimeOffset(c.Time, TimeSpan.Zero).ToUnixTimeMilliseconds(),
                    Open = c.Open,
                    High = c.High,
                    Low = c.Low,
                    Close = c.Close,
                    Volume = c.Volume
                })
                .FirstOrDefaultAsync();

            if (candle == null)
                return NotFound(new { error = "No data found" });

            return Ok(candle);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting latest candle for {Symbol}", symbol);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Агрегация 1MIN свечей в более крупный таймфрейм
    /// </summary>
    private static List<CandleDto> AggregateCandles(List<Candle> candles, int resolutionMinutes)
    {
        if (candles.Count == 0)
            return new List<CandleDto>();

        return candles
            .GroupBy(c => GetPeriodStart(c.Time, resolutionMinutes))
            .Select(g => new CandleDto
            {
                Time = new DateTimeOffset(g.Key, TimeSpan.Zero).ToUnixTimeMilliseconds(),
                Open = g.First().Open,
                High = g.Max(c => c.High),
                Low = g.Min(c => c.Low),
                Close = g.Last().Close,
                Volume = g.Sum(c => c.Volume)
            })
            .OrderBy(c => c.Time)
            .ToList();
    }

    /// <summary>
    /// Получить начало периода для группировки
    /// </summary>
    private static DateTime GetPeriodStart(DateTime time, int resolutionMinutes)
    {
        if (resolutionMinutes >= 1440) // День
        {
            return new DateTime(time.Year, time.Month, time.Day, 0, 0, 0, DateTimeKind.Utc);
        }

        var totalMinutes = (int)(time - new DateTime(time.Year, time.Month, time.Day, 0, 0, 0, DateTimeKind.Utc)).TotalMinutes;
        var periodStart = (totalMinutes / resolutionMinutes) * resolutionMinutes;

        return new DateTime(time.Year, time.Month, time.Day, 0, 0, 0, DateTimeKind.Utc)
            .AddMinutes(periodStart);
    }
}