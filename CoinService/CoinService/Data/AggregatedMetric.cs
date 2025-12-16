using System.ComponentModel.DataAnnotations;

namespace CoinService.Data;

/// <summary>
/// Модель для хранения агрегированных метрик рынка.
/// Используется для хранения предрассчитанных данных по группам монет (TOTAL, OTHERS и т.д.),
/// что позволяет быстро строить графики "Общий AVG", "D TOTAL" и "BID/ASK TOTAL" без вычислений на лету.
/// </summary>
public class AggregatedMetric
{
    /// <summary>
    /// Время формирования снимка (UTC).
    /// Данные агрегируются с шагом 1 минута.
    /// </summary>
    public DateTime Time { get; set; }

    /// <summary>
    /// Категория агрегации (Coin Type).
    /// Значения согласно ТЗ: 
    /// - TOTAL (все пары)
    /// - TOTAL1 (без BTC)
    /// - TOTAL2 (без BTC, ETH)
    /// - TOTAL3 (без BTC, ETH, SOL)
    /// - OTHERS (без топ-10 валют)
    /// </summary>
    [MaxLength(20)]
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Биржа (например, BINANCE).
    /// </summary>
    [MaxLength(50)]
    public string ExchangeId { get; set; } = string.Empty;

    /// <summary>
    /// Тип рынка (SPOT или FUTURES).
    /// </summary>
    [MaxLength(20)]
    public string MarketType { get; set; } = "SPOT";

    /// <summary>
    /// Количество монет, участвовавших в расчете данной агрегации.
    /// Используется для вычисления среднего значения (AVG).
    /// </summary>
    public int CoinsCount { get; set; }

    // ========================================================================
    // Суммарные объемы (Sum of Bids/Asks)
    // Используются для индикаторов "D TOTAL" и "BID/ASK TOTAL".
    // Логика: Сумма объемов всех монет, попавших в категорию.
    // ========================================================================

    public decimal BidVolume_1_5 { get; set; }
    public decimal AskVolume_1_5 { get; set; }

    public decimal BidVolume_3 { get; set; }
    public decimal AskVolume_3 { get; set; }

    public decimal BidVolume_5 { get; set; }
    public decimal AskVolume_5 { get; set; }

    public decimal BidVolume_8 { get; set; }
    public decimal AskVolume_8 { get; set; }

    public decimal BidVolume_15 { get; set; }
    public decimal AskVolume_15 { get; set; }

    public decimal BidVolume_30 { get; set; }
    public decimal AskVolume_30 { get; set; }

    // ========================================================================
    // Индикатор "Общий AVG" (Average Delta)
    // Логика ТЗ: (Сумма персональных дельт всех монет) / (Количество монет).
    // Персональная дельта = Bid / Ask на указанной глубине.
    // Если поле null, значит данных было недостаточно для расчета.
    // ========================================================================

    public decimal? AvgDelta_1_5 { get; set; }
    public decimal? AvgDelta_3 { get; set; }
    public decimal? AvgDelta_5 { get; set; }
    public decimal? AvgDelta_8 { get; set; }
    public decimal? AvgDelta_15 { get; set; }
    public decimal? AvgDelta_30 { get; set; }
}