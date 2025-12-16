namespace CoinService.Api.Dto;

/// <summary>
/// Ответ для TradingView графика
/// </summary>
public class CandlesResponse
{
    public List<CandleDto> Bars { get; set; } = new();
    public bool NoData { get; set; }
}

/// <summary>
/// Формат свечи для TradingView Lightweight Charts
/// </summary>
public class CandleDto
{
    public long Time { get; set; }      // Unix timestamp (секунды или миллисекунды)
    public decimal Open { get; set; }
    public decimal High { get; set; }
    public decimal Low { get; set; }
    public decimal Close { get; set; }
    public decimal Volume { get; set; }
}