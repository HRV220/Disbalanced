using System.ComponentModel.DataAnnotations;

namespace CoinService.Data;

/// <summary>
/// Основная модель данных для хранения "сырых" метрик по конкретной торговой паре (Category: COIN).
/// Соответствует пункту "Сбор данных -> Сохранение" в ТЗ.
/// Хранит снимок стакана (Order Book) с агрегированными объемами на заданных глубинах.
/// </summary>
public class MarketMetric
{
    /// <summary>
    /// Временная метка снимка (UTC).
    /// Частота сбора: 1 раз в минуту.
    /// </summary>
    public DateTime Time { get; set; }

    /// <summary>
    /// Уникальный идентификатор инструмента (например, "BINANCE_SPOT_BTC_USDT").
    /// </summary>
    [MaxLength(100)]
    public string Symbol { get; set; } = string.Empty;

    /// <summary>
    /// Идентификатор биржи (например, "BINANCE").
    /// </summary>
    [MaxLength(50)]
    public string ExchangeId { get; set; } = string.Empty;

    /// <summary>
    /// Тип рынка (SPOT или FUTURES).
    /// </summary>
    [MaxLength(20)]
    public string MarketType { get; set; } = "SPOT";

    /// <summary>
    /// Базовый актив (например, "BTC").
    /// Используется для фильтрации при расчете агрегатов (TOTAL1, TOTAL2 и т.д.).
    /// </summary>
    [MaxLength(20)]
    public string BaseAsset { get; set; } = string.Empty;

    /// <summary>
    /// Котируемый актив (например, "USDT").
    /// </summary>
    [MaxLength(20)]
    public string QuoteAsset { get; set; } = string.Empty;

    /// <summary>
    /// Средняя цена ((BestBid + BestAsk) / 2) на момент снимка.
    /// От этой цены рассчитываются процентные уровни глубины.
    /// </summary>
    public decimal MidPrice { get; set; }

    // ========================================================================
    // Объемы заявок (Cumulative Volume)
    // Рассчитываются как сумма (Price * Size) всех ордеров в пределах глубины.
    // Единица измерения: Валюта котировки (обычно USDT).
    // Используются для построения индикаторов "Глубина рынка" (BID/ASK) и "Диф" (DIV).
    // ========================================================================

    // Глубина 1.5%
    public decimal BidVolume_1_5 { get; set; }
    public decimal AskVolume_1_5 { get; set; }

    // Глубина 3%
    public decimal BidVolume_3 { get; set; }
    public decimal AskVolume_3 { get; set; }

    // Глубина 5%
    public decimal BidVolume_5 { get; set; }
    public decimal AskVolume_5 { get; set; }

    // Глубина 8%
    public decimal BidVolume_8 { get; set; }
    public decimal AskVolume_8 { get; set; }

    // Глубина 15%
    public decimal BidVolume_15 { get; set; }
    public decimal AskVolume_15 { get; set; }

    // Глубина 30%
    public decimal BidVolume_30 { get; set; }
    public decimal AskVolume_30 { get; set; }

    /// <summary>
    /// Вспомогательный метод для заполнения свойств объема по значению глубины.
    /// Упрощает код калькулятора, избавляя от длинных цепочек if/else.
    /// </summary>
    /// <param name="depth">Процент глубины (1.5, 3, 5, ...)</param>
    /// <param name="bid">Рассчитанный объем покупок</param>
    /// <param name="ask">Рассчитанный объем продаж</param>
    public void SetDepthVolumes(decimal depth, decimal bid, decimal ask)
    {
        switch (depth)
        {
            case 1.5m: BidVolume_1_5 = bid; AskVolume_1_5 = ask; break;
            case 3m: BidVolume_3 = bid; AskVolume_3 = ask; break;
            case 5m: BidVolume_5 = bid; AskVolume_5 = ask; break;
            case 8m: BidVolume_8 = bid; AskVolume_8 = ask; break;
            case 15m: BidVolume_15 = bid; AskVolume_15 = ask; break;
            case 30m: BidVolume_30 = bid; AskVolume_30 = ask; break;
        }
    }
}