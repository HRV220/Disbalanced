using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoinService.Data;

public class Candle
{
    /// <summary>
    /// Время открытия свечи (ключ партицирования)
    /// </summary>
    public DateTime Time { get; set; }

    /// <summary>
    /// Символ (BINANCE_SPOT_BTC_USDT)
    /// </summary>
    [MaxLength(100)]
    public string Symbol { get; set; } = string.Empty;

    /// <summary>
    /// Период (например, "1MIN")
    /// </summary>
    [MaxLength(10)]
    public string Period { get; set; } = string.Empty;

    [MaxLength(50)]
    public string ExchangeId { get; set; } = string.Empty;

    [MaxLength(20)]
    public string BaseAsset { get; set; } = string.Empty;

    [MaxLength(20)]
    public string QuoteAsset { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,8)")]
    public decimal Open { get; set; }

    [Column(TypeName = "decimal(18,8)")]
    public decimal High { get; set; }

    [Column(TypeName = "decimal(18,8)")]
    public decimal Low { get; set; }

    [Column(TypeName = "decimal(18,8)")]
    public decimal Close { get; set; }

    [Column(TypeName = "decimal(28,8)")]
    public decimal Volume { get; set; }

    /// <summary>
    /// Количество сделок
    /// </summary>
    public int TradesCount { get; set; }
}