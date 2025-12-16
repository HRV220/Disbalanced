using CoinService.Configuration;
using CoinService.Data;
using Microsoft.Extensions.Options;

namespace CoinService.Services;

public class AggregationService
{
    private readonly ILogger<AggregationService> _logger;

    private static readonly HashSet<string> Top10Coins = new(StringComparer.OrdinalIgnoreCase)
    {
        "BTC", "ETH", "XRP", "BNB", "SOL", "TRX", "DOGE", "ADA", "LINK", "BCH"
    };

    public AggregationService(ILogger<AggregationService> logger)
    {
        _logger = logger;
    }

    public List<AggregatedMetric> CalculateAggregates(
        List<MarketMetric> metrics,
        DateTime timestamp,
        string exchangeId,
        string marketType)
    {
        var result = new List<AggregatedMetric>();

        if (metrics.Count == 0) return result;

        result.Add(CalculateCategory(metrics, "TOTAL", timestamp, exchangeId, marketType));

        var total1 = metrics.Where(m => !m.BaseAsset.Equals("BTC", StringComparison.OrdinalIgnoreCase)).ToList();
        if (total1.Count > 0)
            result.Add(CalculateCategory(total1, "TOTAL1", timestamp, exchangeId, marketType));

        var total2 = metrics.Where(m =>
            !m.BaseAsset.Equals("BTC", StringComparison.OrdinalIgnoreCase) &&
            !m.BaseAsset.Equals("ETH", StringComparison.OrdinalIgnoreCase)).ToList();
        if (total2.Count > 0)
            result.Add(CalculateCategory(total2, "TOTAL2", timestamp, exchangeId, marketType));

        var others = metrics.Where(m => !Top10Coins.Contains(m.BaseAsset)).ToList();
        if (others.Count > 0)
            result.Add(CalculateCategory(others, "OTHERS", timestamp, exchangeId, marketType));

        return result;
    }

    private AggregatedMetric CalculateCategory(
        List<MarketMetric> metrics,
        string category,
        DateTime timestamp,
        string exchangeId,
        string marketType)
    {
        return new AggregatedMetric
        {
            Time = timestamp,
            Category = category,
            ExchangeId = exchangeId,
            MarketType = marketType,
            CoinsCount = metrics.Count,
            BidVolume_1_5 = metrics.Sum(m => m.BidVolume_1_5),
            AskVolume_1_5 = metrics.Sum(m => m.AskVolume_1_5),
            BidVolume_3 = metrics.Sum(m => m.BidVolume_3),
            AskVolume_3 = metrics.Sum(m => m.AskVolume_3),
            BidVolume_5 = metrics.Sum(m => m.BidVolume_5),
            AskVolume_5 = metrics.Sum(m => m.AskVolume_5),
            BidVolume_8 = metrics.Sum(m => m.BidVolume_8),
            AskVolume_8 = metrics.Sum(m => m.AskVolume_8),
            BidVolume_15 = metrics.Sum(m => m.BidVolume_15),
            AskVolume_15 = metrics.Sum(m => m.AskVolume_15),
            BidVolume_30 = metrics.Sum(m => m.BidVolume_30),
            AskVolume_30 = metrics.Sum(m => m.AskVolume_30),
            AvgDelta_1_5 = CalcAvg(metrics, m => (m.BidVolume_1_5, m.AskVolume_1_5)),
            AvgDelta_3 = CalcAvg(metrics, m => (m.BidVolume_3, m.AskVolume_3)),
            AvgDelta_5 = CalcAvg(metrics, m => (m.BidVolume_5, m.AskVolume_5)),
            AvgDelta_8 = CalcAvg(metrics, m => (m.BidVolume_8, m.AskVolume_8)),
            AvgDelta_15 = CalcAvg(metrics, m => (m.BidVolume_15, m.AskVolume_15)),
            AvgDelta_30 = CalcAvg(metrics, m => (m.BidVolume_30, m.AskVolume_30))
        };
    }

    private static decimal? CalcAvg(List<MarketMetric> metrics, Func<MarketMetric, (decimal Bid, decimal Ask)> selector)
    {
        var deltas = new List<decimal>();
        foreach (var m in metrics)
        {
            var (bid, ask) = selector(m);
            if (ask > 0) deltas.Add(bid / ask);
        }
        return deltas.Count > 0 ? deltas.Average() : null;
    }
}