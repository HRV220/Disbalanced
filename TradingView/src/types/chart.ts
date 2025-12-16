/**
 * Chart Types for Disbalanced
 */

/** Supported timeframes */
export type Timeframe = "1" | "5" | "15" | "30" | "60" | "240" | "1D" | "1W";

/** Timeframe configuration */
export interface TimeframeConfig {
  value: Timeframe;
  label: string;
  minutes: number;
}

/** Available timeframes */
export const TIMEFRAMES: TimeframeConfig[] = [
  { value: "1", label: "1м", minutes: 1 },
  { value: "5", label: "5м", minutes: 5 },
  { value: "15", label: "15м", minutes: 15 },
  { value: "30", label: "30м", minutes: 30 },
  { value: "60", label: "1ч", minutes: 60 },
  { value: "240", label: "4ч", minutes: 240 },
  { value: "1D", label: "1д", minutes: 1440 },
  { value: "1W", label: "1н", minutes: 10080 },
];

/** Trading symbol */
export interface Symbol {
  symbol: string; // e.g., "BTCUSDT"
  baseAsset: string; // e.g., "BTC"
  quoteAsset: string; // e.g., "USDT"
  description: string; // e.g., "Bitcoin / USDT"
  exchange: string; // e.g., "Binance"
  type: "SPOT" | "FUTURES";
  pricePrecision: number;
  quantityPrecision: number;
}

/** OHLCV candle data */
export interface Candle {
  time: number; // Unix timestamp in milliseconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Real-time price update */
export interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: number;
}

/** Chart display state */
export interface ChartState {
  symbol: string;
  exchange: string;
  timeframe: Timeframe;

  // Price info
  currentPrice: number | null;
  priceChange: number | null;
  priceChangePercent: number | null;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Panel layout
  chartHeightPercent: number;
  indicatorHeightPercent: number;
}

/** Drawing tool types */
export type DrawingTool =
  | "cursor"
  | "crosshair"
  | "trendline"
  | "horizontal_line"
  | "vertical_line"
  | "rectangle"
  | "fibonacci"
  | "text";

/** Drawing tool configuration */
export interface DrawingToolConfig {
  id: DrawingTool;
  label: string;
  icon: string;
  shortcut?: string;
}

/** Available drawing tools */
export const DRAWING_TOOLS: DrawingToolConfig[] = [
  { id: "cursor", label: "Курсор", icon: "MousePointer", shortcut: "V" },
  { id: "crosshair", label: "Перекрестие", icon: "Crosshair", shortcut: "C" },
  {
    id: "trendline",
    label: "Трендовая линия",
    icon: "TrendingUp",
    shortcut: "T",
  },
  {
    id: "horizontal_line",
    label: "Горизонтальная линия",
    icon: "Minus",
    shortcut: "H",
  },
  {
    id: "vertical_line",
    label: "Вертикальная линия",
    icon: "ArrowDown",
    shortcut: "Alt+V",
  },
  { id: "rectangle", label: "Прямоугольник", icon: "Square", shortcut: "R" },
  { id: "fibonacci", label: "Фибоначчи", icon: "GitBranch", shortcut: "F" },
  { id: "text", label: "Текст", icon: "Type", shortcut: "Alt+T" },
];

/** Chart appearance settings */
export interface ChartAppearance {
  theme: "dark" | "light";
  candleUpColor: string;
  candleDownColor: string;
  backgroundColor: string;
  gridColor: string;
  textColor: string;
}

/** Default dark theme appearance */
export const DEFAULT_CHART_APPEARANCE: ChartAppearance = {
  theme: "dark",
  candleUpColor: "#00c853",
  candleDownColor: "#ff5252",
  backgroundColor: "#0a0b0d",
  gridColor: "#1e2129",
  textColor: "#9aa0a6",
};
