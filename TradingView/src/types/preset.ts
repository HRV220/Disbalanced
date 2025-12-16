/**
 * Preset Types for Disbalanced
 * Save and restore chart configurations
 */

import type { IndicatorConfig } from "./indicator";
import type { Timeframe } from "./chart";

/** Saved preset */
export interface Preset {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;

  // Chart configuration
  symbol: string;
  exchange: string;
  timeframe: Timeframe;

  // Indicator configurations
  indicators: IndicatorConfig[];

  // Layout settings
  layout: {
    chartHeightPercent: number;
    indicatorHeightPercent: number;
  };
}

/** Input for creating a new preset */
export interface PresetCreateInput {
  name: string;
  symbol: string;
  exchange: string;
  timeframe: Timeframe;
  indicators: IndicatorConfig[];
  layout: {
    chartHeightPercent: number;
    indicatorHeightPercent: number;
  };
}

/** Input for updating an existing preset */
export interface PresetUpdateInput extends Partial<PresetCreateInput> {
  id: string;
}

/** Preset list item (summary for listing) */
export interface PresetListItem {
  id: string;
  name: string;
  symbol: string;
  timeframe: Timeframe;
  updatedAt: string;
  indicatorCount: number;
}

/** API response for preset list */
export interface PresetListResponse {
  presets: PresetListItem[];
  total: number;
}

/** API response for single preset */
export interface PresetResponse {
  preset: Preset;
}

/** Default preset configuration */
export const DEFAULT_PRESET: Omit<
  Preset,
  "id" | "userId" | "createdAt" | "updatedAt"
> = {
  name: "Рабочий",
  symbol: "BTCUSDT",
  exchange: "Binance",
  timeframe: "1",
  indicators: [],
  layout: {
    chartHeightPercent: 65,
    indicatorHeightPercent: 35,
  },
};
