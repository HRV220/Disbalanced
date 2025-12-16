/**
 * API Client for Disbalanced Backend
 * 
 * Endpoints:
 * - GET /api/symbols - список торговых пар
 * - GET /api/candles - OHLCV свечи
 * - GET /api/candles/latest - последняя свеча
 * - GET /api/indicators/depth - данные глубины стакана
 * - GET /api/indicators/funding - данные фандинга (TODO на бэкенде)
 * - GET /health - проверка здоровья
 * - GET /status - статус сбора данных
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ============================================
// Types (соответствуют DTO бэкенда)
// ============================================

/** OHLCV свеча */
export interface CandleDto {
  time: number;    // Unix timestamp в миллисекундах
  open: number;    // Цена открытия
  high: number;    // Максимальная цена
  low: number;     // Минимальная цена
  close: number;   // Цена закрытия
  volume: number;  // Объём торгов (в базовом активе)
}

/** Ответ API свечей */
export interface CandlesResponse {
  bars: CandleDto[];
  noData: boolean;
}

/** Точка данных глубины стакана */
export interface DepthPoint {
  time: number;      // Unix timestamp в миллисекундах
  bid_1_5: number;   // Объём BID на глубине 1.5%
  bid_3: number;     // Объём BID на глубине 3%
  bid_5: number;     // Объём BID на глубине 5%
  bid_8: number;     // Объём BID на глубине 8%
  bid_15: number;    // Объём BID на глубине 15%
  bid_30: number;    // Объём BID на глубине 30%
  ask_1_5: number;   // Объём ASK на глубине 1.5%
  ask_3: number;     // Объём ASK на глубине 3%
  ask_5: number;     // Объём ASK на глубине 5%
  ask_8: number;     // Объём ASK на глубине 8%
  ask_15: number;    // Объём ASK на глубине 15%
  ask_30: number;    // Объём ASK на глубине 30%
}

/** Ответ API глубины стакана */
export interface DepthIndicatorResponse {
  symbol: string;
  category: string;
  points: DepthPoint[];
}

/** Информация о торговой паре */
export interface SymbolDto {
  symbol: string;       // "BTCUSDT"
  baseAsset: string;    // "BTC"
  quoteAsset: string;   // "USDT"
  description: string;  // "BTC / USDT"
  exchange: string;     // "BINANCE"
}

/** Ответ API списка символов */
export interface SymbolsResponse {
  symbols: SymbolDto[];
}

/** Точка данных фандинга */
export interface FundingPoint {
  time: number;         // Unix timestamp в миллисекундах
  fundingRate: number;  // Ставка фандинга (0.0001 = 0.01%)
}

/** Ответ API фандинга */
export interface FundingResponse {
  points: FundingPoint[];
}

/** Статус здоровья сервиса */
export interface HealthResponse {
  status: string;
  results: Record<string, { status: string; description?: string }>;
}

/** Статус сбора данных */
export interface StatusResponse {
  lastCollection: string;
  symbolsCollected: number;
  lagSeconds: number;
}

/** Параметры запроса свечей */
export interface CandlesRequestParams {
  symbol: string;
  resolution: Resolution;
  from: number;  // Unix timestamp в секундах
  to: number;    // Unix timestamp в секундах
}

/** Параметры запроса глубины */
export interface DepthRequestParams {
  symbol: string;       // "BTCUSDT"
  category: DepthCategory;
  resolution: Resolution;
  from: number;         // Unix timestamp в секундах
  to: number;           // Unix timestamp в секундах
}

/** Категории данных */
export type DepthCategory = 'COIN' | 'TOTAL' | 'TOTAL1' | 'TOTAL2' | 'TOTAL3' | 'OTHERS';

/** Разрешения (интервалы) — общий тип для candles и depth */
export type Resolution = '1' | '5' | '15' | '30' | '60' | '240' | 'D';

/** @deprecated Use Resolution instead */
export type DepthResolution = Resolution;

// ============================================
// API Client
// ============================================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('[API] Request:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('[API] Error:', error);
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('[API] Response:', endpoint, 
      `${data.points?.length || data.symbols?.length || data.bars?.length || 0} items`);
    
    return data;
  }

  // ============================================
  // Health & Status
  // ============================================

  /** Проверка здоровья сервиса */
  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  /** Статус сбора данных */
  async getStatus(): Promise<StatusResponse> {
    return this.request<StatusResponse>('/status');
  }

  // ============================================
  // Symbols
  // ============================================

  /** Получить список торговых пар */
  async getSymbols(): Promise<SymbolsResponse> {
    return this.request<SymbolsResponse>('/api/symbols');
  }

  // ============================================
  // Candles (OHLCV)
  // ============================================

  /** Получить исторические свечи */
  async getCandles(params: CandlesRequestParams): Promise<CandlesResponse> {
    const query = new URLSearchParams({
      symbol: params.symbol,
      resolution: params.resolution,
      from: params.from.toString(),
      to: params.to.toString(),
    });

    return this.request<CandlesResponse>(`/api/candles?${query}`);
  }

  /** Получить последнюю свечу */
  async getLatestCandle(symbol: string, resolution?: Resolution): Promise<CandleDto> {
    const params: Record<string, string> = { symbol };
    if (resolution) {
      params.resolution = resolution;
    }
    const query = new URLSearchParams(params);
    return this.request<CandleDto>(`/api/candles/latest?${query}`);
  }

  // ============================================
  // Depth Indicators
  // ============================================

  /** Получить данные глубины стакана */
  async getDepth(params: DepthRequestParams): Promise<DepthIndicatorResponse> {
    const query = new URLSearchParams({
      symbol: params.symbol,
      category: params.category,
      resolution: params.resolution,
      from: params.from.toString(),
      to: params.to.toString(),
    });

    return this.request<DepthIndicatorResponse>(`/api/indicators/depth?${query}`);
  }

  // ============================================
  // Funding (TODO на бэкенде)
  // ============================================

  /** Получить данные фандинга */
  async getFunding(symbol: string, from: number, to: number): Promise<FundingResponse> {
    const query = new URLSearchParams({
      symbol,
      from: from.toString(),
      to: to.toString(),
    });

    return this.request<FundingResponse>(`/api/indicators/funding?${query}`);
  }
}

// ============================================
// Singleton
// ============================================

export const apiClient = new ApiClient();

// ============================================
// React Query Keys
// ============================================

export const apiKeys = {
  health: ['health'] as const,
  status: ['status'] as const,
  symbols: ['symbols'] as const,
  candles: (symbol: string, resolution: Resolution, from: number, to: number) =>
    ['candles', symbol, resolution, from, to] as const,
  latestCandle: (symbol: string) => ['latestCandle', symbol] as const,
  depth: (params: DepthRequestParams) => 
    ['depth', params.symbol, params.category, params.resolution, params.from, params.to] as const,
  funding: (symbol: string, from: number, to: number) => 
    ['funding', symbol, from, to] as const,
};
