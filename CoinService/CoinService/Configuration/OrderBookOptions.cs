namespace CoinService.Configuration;

public class OrderBookOptions
{
    public const string SectionName = "OrderBook";
    public decimal[] DepthLevels { get; set; } = { 1.5m, 3m, 5m, 8m, 15m, 30m };
}