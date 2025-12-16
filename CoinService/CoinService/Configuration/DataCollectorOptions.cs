namespace CoinService.Configuration;

public class DataCollectorOptions
{
    public const string SectionName = "DataCollector";

    public int CollectionIntervalMinutes { get; set; } = 1;
    public int MaxDegreeOfParallelism { get; set; } = 50;
    public int OrderBookLimitLevels { get; set; } = 0;
    public int SymbolsRefreshIntervalHours { get; set; } = 1;
    public int BatchSize { get; set; } = 200;
    public string[] Exchanges { get; set; } = { "BINANCE" };
    public string[] MarketTypes { get; set; } = { "SPOT" };
    public string[] QuoteAssets { get; set; } = { "USDT" };
    public decimal MinVolume24hUsd { get; set; } = 0;
    public int MaxSymbols { get; set; } = 20;
}