using APIBricks.CoinAPI.MarketDataAPI.REST.V1.Model;
using CoinService.Configuration;
using CoinService.Models;

namespace CoinService.Helpers;

public static class SymbolFilterHelper
{
    public static List<SymbolInfo> FilterSymbols(
        IEnumerable<V1Symbol> symbols,
        DataCollectorOptions options)
    {
        var query = symbols
            .Where(s => IsValidSymbol(s, options))
            .OrderByDescending(s => s.Volume1dayUsd ?? 0)
            .Select(s => new SymbolInfo(
                s.SymbolId!,
                s.ExchangeId ?? string.Empty,
                s.SymbolType ?? "SPOT",
                s.AssetIdBase ?? string.Empty,
                s.AssetIdQuote ?? string.Empty));

        if (options.MaxSymbols > 0)
        {
            query = query.Take(options.MaxSymbols);
        }

        return query.ToList();
    }

    private static bool IsValidSymbol(V1Symbol symbol, DataCollectorOptions options)
    {
        if (string.IsNullOrEmpty(symbol.SymbolId) ||
            string.IsNullOrEmpty(symbol.AssetIdQuote) ||
            string.IsNullOrEmpty(symbol.SymbolType))
        {
            return false;
        }

        if (!options.MarketTypes.Contains(symbol.SymbolType))
            return false;

        if (!options.QuoteAssets.Contains(symbol.AssetIdQuote))
            return false;

        if (options.MinVolume24hUsd > 0 &&
            symbol.Volume1dayUsd.HasValue &&
            (decimal)symbol.Volume1dayUsd.Value < options.MinVolume24hUsd)
        {
            return false;
        }

        return true;
    }
}