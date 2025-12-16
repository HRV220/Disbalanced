namespace CoinService.Api.Dto;

public class SymbolsResponse
{
    public List<SymbolDto> Symbols { get; set; } = new();
}

public class SymbolDto
{
    public string Symbol { get; set; } = string.Empty;
    public string BaseAsset { get; set; } = string.Empty;
    public string QuoteAsset { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Exchange { get; set; } = string.Empty;
}