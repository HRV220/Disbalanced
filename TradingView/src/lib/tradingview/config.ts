/**
 * TradingView Widget Configuration
 */

import type {
  ChartingLibraryWidgetOptions,
  ResolutionString,
} from "../../types/tradingview";

// ============================================
// Theme Colors
// ============================================

export const DARK_THEME = {
  "paneProperties.background": "#0a0b0d",
  "paneProperties.backgroundType": "solid",
  "paneProperties.vertGridProperties.color": "#1e2129",
  "paneProperties.horzGridProperties.color": "#1e2129",
  "scalesProperties.backgroundColor": "#0a0b0d",
  "scalesProperties.textColor": "#9aa0a6",
  "scalesProperties.lineColor": "#1e2129",
  "mainSeriesProperties.candleStyle.upColor": "#22c55e",
  "mainSeriesProperties.candleStyle.downColor": "#ef4444",
  "mainSeriesProperties.candleStyle.borderUpColor": "#22c55e",
  "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
  "mainSeriesProperties.candleStyle.wickUpColor": "#22c55e",
  "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
};

// ============================================
// Disabled Features
// ============================================

export const DISABLED_FEATURES: string[] = [
  "header_symbol_search",
  "header_resolutions", // <--- ВАЖНО: Убирает 1m 5m внутри графика
  "header_compare",
  "header_undo_redo",
  "header_screenshot",
  "header_fullscreen_button",
  "compare_symbol",
  "display_market_status",
  "popup_hints",
  "left_toolbar", // <--- ВАЖНО: Убирает инструменты рисования слева (если вы хотите свои или просто место)
  "control_bar", // <--- ВАЖНО: Убирает нижний бар
  "timeframes_toolbar", // <--- ВАЖНО: Убирает нижние кнопки 1D 5D 1M
];

// ============================================
// Enabled Features
// ============================================

export const ENABLED_FEATURES: string[] = [
  "hide_left_toolbar_by_default",
  "move_logo_to_main_pane",
];

// ============================================
// Default Widget Options
// ============================================

export function getDefaultWidgetOptions(
  container: HTMLElement,
  symbol: string,
  resolution: ResolutionString
): Omit<ChartingLibraryWidgetOptions, "datafeed"> {
  return {
    container,
    symbol,
    interval: resolution,
    library_path: "/charting_library/",
    locale: "ru",
    fullscreen: false,
    autosize: true,
    theme: "dark",
    timezone: "Europe/Moscow",

    // Toolbar settings
    enabled_features: ENABLED_FEATURES,
    disabled_features: DISABLED_FEATURES,

    // Override colors
    overrides: DARK_THEME,

    // Loading screen
    loading_screen: {
      backgroundColor: "#0a0b0d",
      foregroundColor: "#3b82f6",
    },

    // Custom CSS
    custom_css_url: "/tradingview-custom.css",

    // Chart settings
    charts_storage_api_version: "1.1",
    client_id: "disbalanced",
    user_id: "public_user",

    // Time settings
    time_frames: [
      { text: "1д", resolution: "5" as ResolutionString, description: "1 Day" },
      {
        text: "1н",
        resolution: "15" as ResolutionString,
        description: "1 Week",
      },
      {
        text: "1м",
        resolution: "60" as ResolutionString,
        description: "1 Month",
      },
      {
        text: "3м",
        resolution: "240" as ResolutionString,
        description: "3 Months",
      },
      {
        text: "1г",
        resolution: "D" as ResolutionString,
        description: "1 Year",
      },
    ],
  };
}
