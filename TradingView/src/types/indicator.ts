/**
 * Indicator Types for Disbalanced
 * Order Book depth analysis indicators
 */

/** Available depth levels for order book analysis */
export type DepthLevel = "1.5" | "3" | "5" | "8" | "15" | "30";

/** All depth levels array */
export const DEPTH_LEVELS: DepthLevel[] = ["1.5", "3", "5", "8", "15", "30"];

/** Types of available indicators */
export type IndicatorType =
  | "BID_ASK" // Market Depth (main indicator)
  | "DIV" // Difference (BID - ASK)
  | "DELTA" // Delta (BID / ASK)
  | "AVG" // Average across all coins
  | "BID_ASK_TOTAL" // Total BID/ASK across all pairs
  | "D_TOTAL" // Delta Total
  | "FUNDING"; // Funding rate

/** Indicator type labels for UI */
export const INDICATOR_TYPE_LABELS: Record<IndicatorType, string> = {
  BID_ASK: "Глубина рынка (BID/ASK)",
  DIV: "Диф (разница)",
  DELTA: "Delta (соотношение)",
  AVG: "Общий AVG",
  BID_ASK_TOTAL: "BID/ASK TOTAL",
  D_TOTAL: "D TOTAL",
  FUNDING: "Фандинг",
};

/** Categories for data aggregation */
export type CoinCategory =
  | "COIN" // Specific trading pair
  | "TOTAL" // All pairs
  | "TOTAL1" // All except BTC
  | "TOTAL2" // All except BTC and ETH
  | "TOTAL3" // All except BTC, ETH, and SOL
  | "OTHERS"; // All except top 10

/** Category labels for UI */
export const COIN_CATEGORY_LABELS: Record<CoinCategory, string> = {
  COIN: "Монета",
  TOTAL: "TOTAL (все)",
  TOTAL1: "TOTAL 1 (без BTC)",
  TOTAL2: "TOTAL 2 (без BTC, ETH)",
  TOTAL3: "TOTAL 3 (без BTC, ETH, SOL)",
  OTHERS: "OTHERS (без топ-10)",
};

/** Top 10 coins excluded from OTHERS category */
export const TOP_10_COINS = [
  "BTC",
  "ETH",
  "XRP",
  "BNB",
  "SOL",
  "TRX",
  "DOGE",
  "ADA",
  "LINK",
  "BCH",
] as const;

/** Mixed DIFF configuration (different depths for BID and ASK) */
export interface MixedDiff {
  id: string;
  bidDepth: DepthLevel;
  askDepth: DepthLevel;
  enabled: boolean;
  color: string;
}

/** Predefined mixed DIFF combinations */
export const MIXED_DIFF_PRESETS: Array<{
  id: string;
  bidDepth: DepthLevel;
  askDepth: DepthLevel;
}> = [
  { id: "3B-8A", bidDepth: "3", askDepth: "8" },
  { id: "8B-3A", bidDepth: "8", askDepth: "3" },
  { id: "8B-30A", bidDepth: "8", askDepth: "30" },
  { id: "5B-15A", bidDepth: "5", askDepth: "15" },
  { id: "15B-5A", bidDepth: "15", askDepth: "5" },
  { id: "8B-15A", bidDepth: "8", askDepth: "15" },
  { id: "15B-8A", bidDepth: "15", askDepth: "8" },
  { id: "15B-30A", bidDepth: "15", askDepth: "30" },
  { id: "30B-15A", bidDepth: "30", askDepth: "15" },
];

/** Color configuration for indicator lines */
export interface IndicatorColors {
  bids: Record<DepthLevel, string>;
  asks: Record<DepthLevel, string>;
  diffs: Record<DepthLevel, string>;
}

/** Default colors for indicators */
export const DEFAULT_INDICATOR_COLORS: IndicatorColors = {
  bids: {
    "1.5": "#22c55e",
    "3": "#16a34a",
    "5": "#15803d",
    "8": "#166534",
    "15": "#14532d",
    "30": "#052e16",
  },
  asks: {
    "1.5": "#ef4444",
    "3": "#dc2626",
    "5": "#b91c1c",
    "8": "#991b1b",
    "15": "#7f1d1d",
    "30": "#450a0a",
  },
  diffs: {
    "1.5": "#60a5fa",
    "3": "#3b82f6",
    "5": "#2563eb",
    "8": "#1d4ed8",
    "15": "#1e40af",
    "30": "#1e3a8a",
  },
};

/** BID/ASK indicator configuration */
export interface BidAskIndicatorConfig {
  id: string;
  type: "BID_ASK";
  name: string;
  category: CoinCategory;

  // Enabled components
  bids: DepthLevel[];
  asks: DepthLevel[];
  diffs: DepthLevel[];
  mixedDiffs: MixedDiff[];

  // Visual settings
  colors: IndicatorColors;
  visible: boolean;
  expanded: boolean;

  // Panel height (for resizing)
  height?: number;
}

/** Generic indicator configuration */
export type IndicatorConfig = BidAskIndicatorConfig; // | OtherIndicatorConfigs...

/** Single data point from the backend */
export interface IndicatorDataPoint {
  timestamp: number; // Unix timestamp in milliseconds

  // BID volumes by depth (in USD)
  bid_1_5?: number;
  bid_3?: number;
  bid_5?: number;
  bid_8?: number;
  bid_15?: number;
  bid_30?: number;

  // ASK volumes by depth (in USD)
  ask_1_5?: number;
  ask_3?: number;
  ask_5?: number;
  ask_8?: number;
  ask_15?: number;
  ask_30?: number;
}

/** Calculated values including DIFFs */
export interface CalculatedIndicatorData extends IndicatorDataPoint {
  // Calculated DIFFs (BID - ASK)
  diff_1_5?: number;
  diff_3?: number;
  diff_5?: number;
  diff_8?: number;
  diff_15?: number;
  diff_30?: number;

  // Mixed DIFFs
  [key: `mixed_${string}`]: number | undefined;
}

/** API response for indicator data */
export interface IndicatorDataResponse {
  symbol: string;
  timeframe: string;
  category: CoinCategory;
  from: number;
  to: number;
  points: IndicatorDataPoint[];
}

/** Helper to get BID key for a depth level */
export const getBidKey = (depth: DepthLevel): keyof IndicatorDataPoint => {
  return `bid_${depth.replace(".", "_")}` as keyof IndicatorDataPoint;
};

/** Helper to get ASK key for a depth level */
export const getAskKey = (depth: DepthLevel): keyof IndicatorDataPoint => {
  return `ask_${depth.replace(".", "_")}` as keyof IndicatorDataPoint;
};

/** Helper to get DIFF key for a depth level */
export const getDiffKey = (
  depth: DepthLevel
): keyof CalculatedIndicatorData => {
  return `diff_${depth.replace(".", "_")}` as keyof CalculatedIndicatorData;
};

/** Calculate DIFFs from raw data */
export function calculateDiffs(
  point: IndicatorDataPoint
): CalculatedIndicatorData {
  const calculated: CalculatedIndicatorData = { ...point };

  for (const depth of DEPTH_LEVELS) {
    const bidKey = getBidKey(depth);
    const askKey = getAskKey(depth);
    const diffKey = getDiffKey(depth);

    const bid = point[bidKey];
    const ask = point[askKey];

    if (bid !== undefined && ask !== undefined) {
      (calculated as any)[diffKey] = bid - ask;
    }
  }

  return calculated;
}

/** Format volume value for display */
export function formatVolume(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}
