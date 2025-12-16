/**
 * TradingView Charting Library Types
 * Minimal type definitions for our usage
 */

export type ResolutionString =
  | "1"
  | "5"
  | "15"
  | "30"
  | "60"
  | "240"
  | "D"
  | "1D"
  | "W"
  | "M";

export interface ChartingLibraryWidgetOptions {
  container: HTMLElement;
  datafeed: IBasicDataFeed;
  symbol: string;
  interval: ResolutionString;
  library_path: string;
  locale?: string;
  fullscreen?: boolean;
  autosize?: boolean;
  theme?: "light" | "dark";
  timezone?: string;
  enabled_features?: string[];
  disabled_features?: string[];
  overrides?: Record<string, string>;
  loading_screen?: {
    backgroundColor?: string;
    foregroundColor?: string;
  };
  custom_css_url?: string;
  charts_storage_api_version?: string;
  client_id?: string;
  user_id?: string;
  time_frames?: Array<{
    text: string;
    resolution: ResolutionString;
    description?: string;
  }>;
  debug?: boolean;
}

export interface IBasicDataFeed {
  onReady: (callback: (config: DatafeedConfiguration) => void) => void;
  searchSymbols: (
    userInput: string,
    exchange: string,
    symbolType: string,
    onResult: (result: SearchSymbolResultItem[]) => void
  ) => void;
  resolveSymbol: (
    symbolName: string,
    onResolve: (symbolInfo: LibrarySymbolInfo) => void,
    onError: (reason: string) => void
  ) => void;
  getBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: (bars: Bar[], meta: { noData: boolean }) => void,
    onError: (reason: string) => void
  ) => void;
  subscribeBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: (bar: Bar) => void,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void
  ) => void;
  unsubscribeBars: (listenerGuid: string) => void;
  getServerTime?: (callback: (serverTime: number) => void) => void;
}

export interface DatafeedConfiguration {
  supported_resolutions: string[];
  exchanges?: Array<{ value: string; name: string; desc: string }>;
  symbols_types?: Array<{ name: string; value: string }>;
}

export interface SearchSymbolResultItem {
  symbol: string;
  full_name: string;
  description: string;
  exchange: string;
  type: string;
}

export interface LibrarySymbolInfo {
  name: string;
  full_name: string;
  description: string;
  type: string;
  session: string;
  timezone: string;
  exchange: string;
  minmov: number;
  pricescale: number;
  has_intraday: boolean;
  has_daily: boolean;
  has_weekly_and_monthly: boolean;
  supported_resolutions: string[];
  volume_precision: number;
  data_status: string;
}

export interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface PeriodParams {
  from: number;
  to: number;
  countBack?: number;
  firstDataRequest: boolean;
}

export interface IChartingLibraryWidget {
  onChartReady: (callback: () => void) => void;
  activeChart: () => IChartWidgetApi;
  setSymbol: (symbol: string, callback: () => void) => void;
  remove: () => void;
  chart: () => IChartWidgetApi;
}

export interface IChartWidgetApi {
  setSymbol: (symbol: string, callback?: () => void) => void;
  setResolution: (resolution: ResolutionString, callback?: () => void) => void;
  symbol: () => string;
  resolution: () => ResolutionString;
  getVisibleRange: () => { from: number; to: number };
  setVisibleRange: (range: { from: number; to: number }) => Promise<void>;
  onVisibleRangeChanged: () => ISubscription;
  onSymbolChanged: () => ISubscription;
  onIntervalChanged: () => ISubscription;
  createStudy: (
    name: string,
    forceOverlay: boolean,
    lock: boolean,
    inputs?: any[],
    overrides?: Record<string, any>,
    options?: { checkLimit?: boolean; priceScale?: string }
  ) => Promise<string | null>;
}

export interface ISubscription {
  subscribe: (
    obj: null,
    callback: (...args: any[]) => void,
    singleShot?: boolean
  ) => void;
  unsubscribe: (obj: null, callback: (...args: any[]) => void) => void;
  unsubscribeAll: (obj: null) => void;
}

// Global TradingView widget constructor
declare global {
  interface Window {
    TradingView?: {
      widget: new (
        options: ChartingLibraryWidgetOptions
      ) => IChartingLibraryWidget;
    };
  }
}
