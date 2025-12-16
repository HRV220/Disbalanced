namespace CoinService.Models;

public record SymbolInfo(
    string SymbolId,
    string ExchangeId,
    string MarketType,
    string BaseAsset,
    string QuoteAsset);