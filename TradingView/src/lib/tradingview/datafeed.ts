/**
 * TradingView Datafeed Implementation (Debug Version)
 *
 * Connects TradingView Charting Library to our backend API.
 * Includes extensive logging to debug "Value is null" errors.
 * Now also loads depth data for custom indicators.
 */

import { apiClient, type Resolution, type SymbolDto, type DepthCategory } from "@/lib/api";
import { getDepthCache } from "./depth-cache";
import type {
  IBasicDataFeed,
  DatafeedConfiguration,
  SearchSymbolResultItem,
  LibrarySymbolInfo,
  Bar,
  PeriodParams,
  ResolutionString,
} from "@/types/tradingview";

// ============================================
// Constants
// ============================================

const SUPPORTED_RESOLUTIONS = ["1", "5", "15", "30", "60", "240", "D", "1D"];

const RESOLUTION_MAP: Record<string, Resolution> = {
  "1": "1",
  "5": "5",
  "15": "15",
  "30": "30",
  "60": "60",
  "240": "240",
  D: "D",
  "1D": "D",
};

// Интервал polling в зависимости от таймфрейма (мс)
// Бэкенд собирает данные раз в минуту, поэтому polling чаще 30 сек бессмысленен
const POLLING_INTERVALS: Record<string, number> = {
  "1": 30000,   // 1м → 30 сек (данные обновляются раз в минуту)
  "5": 30000,   // 5м → 30 сек
  "15": 60000,  // 15м → 1 мин
  "30": 60000,  // 30м → 1 мин
  "60": 60000,  // 1ч → 1 мин
  "240": 120000, // 4ч → 2 мин
  D: 300000,    // 1д → 5 мин
  "1D": 300000,
};

/**
 * Вычисляет оптимальный pricescale на основе символа
 * pricescale определяет количество десятичных знаков: 100 = 2 знака, 10000 = 4 знака
 */
function calculatePriceScale(symbol: string): number {
  const s = symbol.toUpperCase();

  // Мем-коины и микро-токены (цена << $0.01)
  const microTokens = ['SHIB', 'PEPE', 'FLOKI', 'BONK', 'LUNC', 'XEC', 'BTTC', 'WIN', 'HOT', 'SPELL'];
  if (microTokens.some(coin => s.includes(coin))) {
    return 100000000; // 8 знаков: 0.00000001
  }

  // 1000* токены (SHIB и подобные на Binance Futures)
  if (s.startsWith('1000')) {
    return 1000000; // 6 знаков
  }

  // Стейблкоины и форекс-подобные (цена ~$1)
  const stablecoins = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'FDUSD'];
  if (stablecoins.some(coin => s === coin + 'USD' || s === coin + 'USDT')) {
    return 10000; // 4 знака
  }

  // Крупные монеты (BTC $50k+, ETH $2k+)
  const largeCoins = ['BTC', 'ETH', 'BNB'];
  if (largeCoins.some(coin => s.startsWith(coin))) {
    return 100; // 2 знака
  }

  // Средние монеты (большинство альткоинов $1-$1000)
  return 10000; // 4 знака по умолчанию
}

// ============================================
// Datafeed Class
// ============================================

class Datafeed implements IBasicDataFeed {
  private symbolsCache: SymbolDto[] | null = null;
  private lastBars: Map<string, Bar> = new Map();
  private subscribers: Map<
    string,
    {
      symbolInfo: LibrarySymbolInfo;
      resolution: string;
      callback: (bar: Bar) => void;
      intervalId?: ReturnType<typeof setInterval>;
    }
  > = new Map();

  // Depth data settings
  private depthCategory: DepthCategory = 'COIN';

  /**
   * Set the category for depth data loading
   */
  setDepthCategory(category: DepthCategory): void {
    this.depthCategory = category;
    console.log(`[Datafeed] Depth category set to: ${category}`);
  }

  /**
   * Get current depth category
   */
  getDepthCategory(): DepthCategory {
    return this.depthCategory;
  }

  // ============================================
  // onReady - Configuration
  // ============================================

  onReady(callback: (config: DatafeedConfiguration) => void): void {
    console.log("[Datafeed] onReady called");

    setTimeout(() => {
      const config: DatafeedConfiguration = {
        supported_resolutions: SUPPORTED_RESOLUTIONS,
        exchanges: [
          { value: "BINANCE", name: "Binance", desc: "Binance Futures" },
        ],
        symbols_types: [{ name: "Crypto", value: "crypto" }],
      };

      console.log("[Datafeed] Sending configuration:", config);
      callback(config);
    }, 0);
  }

  // ============================================
  // searchSymbols - Symbol Search
  // ============================================

  async searchSymbols(
    userInput: string,
    _exchange: string,
    _symbolType: string,
    onResult: (result: SearchSymbolResultItem[]) => void
  ): Promise<void> {
    console.log("[Datafeed] searchSymbols input:", userInput);

    try {
      if (!this.symbolsCache) {
        console.log("[Datafeed] Cache empty, fetching symbols...");
        const response = await apiClient.getSymbols();
        this.symbolsCache = response.symbols;
      }

      const query = userInput.toUpperCase().replace(/[\-_/]/g, ""); // Упрощаем ввод пользователя

      const results = this.symbolsCache
        .filter((s) => {
          // Нормализуем символ из базы для поиска
          const cleanSymbol = s.symbol.toUpperCase().replace(/[\-_/]/g, "");
          return (
            cleanSymbol.includes(query) ||
            s.baseAsset.includes(query) ||
            (s.description && s.description.toUpperCase().includes(query))
          );
        })
        .slice(0, 30)
        .map((s) => ({
          symbol: s.symbol, // Важно: отдаем оригинальное название для resolveSymbol
          full_name: `BINANCE:${s.symbol}`,
          description: s.description,
          exchange: s.exchange,
          type: "crypto",
        }));

      console.log(
        `[Datafeed] Found ${results.length} symbols for "${userInput}"`
      );
      onResult(results);
    } catch (error) {
      console.error("[Datafeed] searchSymbols error:", error);
      onResult([]);
    }
  }

  // ============================================
  // resolveSymbol - CRITICAL METHOD
  // ============================================

  // ============================================
  // resolveSymbol - С ФОЛЛБЕКОМ
  // ============================================

  async resolveSymbol(
    symbolName: string,
    onResolve: (symbolInfo: LibrarySymbolInfo) => void,
    onError: (reason: string) => void
  ): Promise<void> {
    console.group(`[Datafeed] resolveSymbol: "${symbolName}"`);

    try {
      // 1. Загрузка кэша (если пусто)
      if (!this.symbolsCache || this.symbolsCache.length === 0) {
        try {
          const response = await apiClient.getSymbols();
          this.symbolsCache = response.symbols || [];
        } catch (e) {
          console.warn(
            "[Datafeed] Failed to load symbols list, proceeding blindly"
          );
        }
      }

      // 2. Поиск в кэше
      const searchName = symbolName
        .replace(/^BINANCE:/i, "")
        .replace(/[\-_/]/g, "")
        .toUpperCase();

      let foundSymbol = this.symbolsCache?.find((s) => {
        const cleanDbSymbol = s.symbol.replace(/[\-_/]/g, "").toUpperCase();
        return cleanDbSymbol === searchName || s.symbol === searchName;
      });

      // =========================================================
      // ФИКС: Если символ не найден, создаем "фейковый",
      // чтобы TradingView не крашился.
      // =========================================================
      if (!foundSymbol) {
        console.warn(
          `⚠️ Symbol "${symbolName}" not found in API list! Using Fallback.`
        );

        // Показываем, что есть в списке, для отладки
        if (this.symbolsCache && this.symbolsCache.length > 0) {
          console.log(
            "Available symbols:",
            this.symbolsCache.map((s) => s.symbol).join(", ")
          );
        }

        // Создаем объект "на лету"
        foundSymbol = {
          symbol: symbolName, // Используем то, что запросили (например BTCUSDT)
          baseAsset: "UNK",
          quoteAsset: "UNK",
          description: symbolName,
          exchange: "BINANCE",
        };
      } else {
        console.log("✅ Symbol matched in DB:", foundSymbol.symbol);
      }

      // 3. Настройка точности (PriceScale) — динамическое вычисление
      const pricescale = calculatePriceScale(foundSymbol.symbol);

      // 4. Формируем конфиг
      const symbolInfo: LibrarySymbolInfo = {
        name: foundSymbol.symbol,
        full_name: `BINANCE:${foundSymbol.symbol}`,
        description: foundSymbol.description || foundSymbol.symbol,
        type: "crypto",
        session: "24x7",
        timezone: "Etc/UTC",
        exchange: "BINANCE",
        minmov: 1,
        pricescale: pricescale,
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: true,
        supported_resolutions: SUPPORTED_RESOLUTIONS,
        volume_precision: 4,
        data_status: "streaming",
      };

      console.log("🚀 Resolving with:", symbolInfo);
      onResolve(symbolInfo);
    } catch (error) {
      console.error("❌ resolveSymbol CRASHED:", error);
      onError("Unknown error");
    } finally {
      console.groupEnd();
    }
  }

  // ============================================
  // getBars - Historical Data
  // ============================================

  async getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: (bars: Bar[], meta: { noData: boolean }) => void,
    onError: (reason: string) => void
  ): Promise<void> {
    const { from, to, firstDataRequest } = periodParams;
    const fromDate = new Date(from * 1000).toISOString();
    const toDate = new Date(to * 1000).toISOString();

    console.log(`[Datafeed] getBars requested for ${symbolInfo.name}`);
    console.log(`Range: ${fromDate} -> ${toDate} (Res: ${resolution})`);

    const apiResolution = RESOLUTION_MAP[resolution];
    if (!apiResolution) {
      console.error(`Unsupported resolution: ${resolution}`);
      onError(`Unsupported resolution: ${resolution}`);
      return;
    }

    try {
      const response = await apiClient.getCandles({
        symbol: symbolInfo.name, // Используем имя из symbolInfo (оно должно совпадать с БД)
        resolution: apiResolution,
        from,
        to,
      });

      if (response.noData || !response.bars || response.bars.length === 0) {
        console.log(`[Datafeed] ⚠️ No data returned for ${symbolInfo.name}`);
        onResult([], { noData: true });
        return;
      }

      // Преобразуем в формат TradingView
      const bars: Bar[] = response.bars.map((bar) => ({
        time: bar.time,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume,
      }));

      // Сортируем
      bars.sort((a, b) => a.time - b.time);

      // Сохраняем последний бар
      if (bars.length > 0) {
        const key = `${symbolInfo.name}_${resolution}`;
        this.lastBars.set(key, bars[bars.length - 1]);
      }

      console.log(
        `[Datafeed] ✅ Loaded ${bars.length} bars. First: ${new Date(
          bars[0].time
        ).toISOString()}`
      );

      // Load depth data in parallel (don't block bars)
      this.loadDepthDataAsync(symbolInfo.name, apiResolution, from, to);

      onResult(bars, { noData: false });
    } catch (error) {
      console.error("[Datafeed] getBars API error:", error);
      onError(`Failed to load data: ${error}`);
    }
  }

  /**
   * Load depth data asynchronously (non-blocking)
   * Loads all depth categories (COIN, TOTAL, TOTAL1, TOTAL2, TOTAL3, OTHERS) in parallel
   */
  private async loadDepthDataAsync(
    symbol: string,
    resolution: Resolution,
    from: number,
    to: number
  ): Promise<void> {
    try {
      const depthCache = getDepthCache();
      // Load all depth categories in parallel
      await depthCache.loadMultipleCategories(
        symbol,
        ['COIN', 'TOTAL', 'TOTAL1', 'TOTAL2', 'TOTAL3', 'OTHERS'],
        resolution,
        from,
        to
      );
    } catch (error) {
      console.warn("[Datafeed] Failed to load depth data:", error);
    }
  }

  // ============================================
  // subscribeBars - Real-time Updates
  // ============================================

  private pollingErrors: Map<string, number> = new Map();
  private readonly MAX_POLLING_ERRORS = 5;

  /**
   * Validate OHLC data integrity
   */
  private validateOHLC(bar: Bar): boolean {
    // Check for NaN/Infinity
    if (!Number.isFinite(bar.open) || !Number.isFinite(bar.high) ||
        !Number.isFinite(bar.low) || !Number.isFinite(bar.close)) {
      console.warn('[Datafeed] Invalid OHLC: contains NaN/Infinity', bar);
      return false;
    }

    // Check high >= low
    if (bar.high < bar.low) {
      console.warn('[Datafeed] Invalid OHLC: high < low', bar);
      return false;
    }

    // Check open/close within high-low range
    if (bar.open > bar.high || bar.open < bar.low ||
        bar.close > bar.high || bar.close < bar.low) {
      console.warn('[Datafeed] Invalid OHLC: open/close outside high-low range', bar);
      return false;
    }

    return true;
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: (bar: Bar) => void,
    listenerGuid: string,
    _onResetCacheNeededCallback: () => void
  ): void {
    const pollInterval = POLLING_INTERVALS[resolution] || 5000;

    console.log(
      `[Datafeed] subscribeBars: ${symbolInfo.name} [${resolution}] (GUID: ${listenerGuid}, interval: ${pollInterval}ms)`
    );

    const key = `${symbolInfo.name}_${resolution}`;
    this.pollingErrors.set(key, 0);

    // Преобразуем resolution в формат API
    const apiResolution = RESOLUTION_MAP[resolution];

    // Адаптивный polling в зависимости от таймфрейма
    const intervalId = setInterval(async () => {
      try {
        const latestCandle = await apiClient.getLatestCandle(symbolInfo.name, apiResolution);

        if (!latestCandle) return;

        const bar: Bar = {
          time: latestCandle.time,
          open: latestCandle.open,
          high: latestCandle.high,
          low: latestCandle.low,
          close: latestCandle.close,
          volume: latestCandle.volume,
        };

        // Валидация OHLC данных
        if (!this.validateOHLC(bar)) {
          return;
        }

        const lastBar = this.lastBars.get(key);

        // Обновляем если это новый бар или обновление текущего
        if (!lastBar || bar.time >= lastBar.time) {
          if (bar.time > (lastBar?.time || 0)) {
            console.log(
              `[Datafeed] ⚡ New live bar for ${symbolInfo.name}:`,
              new Date(bar.time).toLocaleTimeString()
            );
          }
          this.lastBars.set(key, bar);
          onTick(bar);
        }

        // Сброс счётчика ошибок при успехе
        this.pollingErrors.set(key, 0);
      } catch (error) {
        // Инкремент счётчика ошибок
        const errorCount = (this.pollingErrors.get(key) || 0) + 1;
        this.pollingErrors.set(key, errorCount);

        if (errorCount === 1) {
          console.warn(`[Datafeed] Polling error for ${symbolInfo.name}:`, error);
        }

        if (errorCount >= this.MAX_POLLING_ERRORS) {
          console.error(
            `[Datafeed] ❌ ${errorCount} consecutive polling errors for ${symbolInfo.name}. Connection may be lost.`
          );
        }
      }
    }, pollInterval);

    this.subscribers.set(listenerGuid, {
      symbolInfo,
      resolution,
      callback: onTick,
      intervalId,
    });
  }

  // ============================================
  // unsubscribeBars
  // ============================================

  unsubscribeBars(listenerGuid: string): void {
    console.log(`[Datafeed] unsubscribeBars: ${listenerGuid}`);
    const subscriber = this.subscribers.get(listenerGuid);
    if (subscriber?.intervalId) {
      clearInterval(subscriber.intervalId);
    }
    this.subscribers.delete(listenerGuid);
  }

  // ============================================
  // getServerTime
  // ============================================

  getServerTime(callback: (serverTime: number) => void): void {
    callback(Math.floor(Date.now() / 1000));
  }
}

// ============================================
// Singleton Instance
// ============================================

let datafeedInstance: Datafeed | null = null;

export interface ExtendedDatafeed extends IBasicDataFeed {
  setDepthCategory(category: DepthCategory): void;
  getDepthCategory(): DepthCategory;
}

export function getDatafeed(): ExtendedDatafeed {
  if (!datafeedInstance) {
    datafeedInstance = new Datafeed();
  }
  return datafeedInstance as ExtendedDatafeed;
}

export function resetDatafeed(): void {
  if (datafeedInstance) {
    datafeedInstance["subscribers"].forEach((sub) => {
      if (sub.intervalId) {
        clearInterval(sub.intervalId);
      }
    });
  }
  datafeedInstance = null;
}
