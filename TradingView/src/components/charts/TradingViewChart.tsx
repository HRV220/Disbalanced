"use client";

import { useEffect, useRef, useCallback } from "react";
import { getDatafeed } from "@/lib/tradingview/datafeed";
import { getDepthCache } from "@/lib/tradingview/depth-cache";
import { cn } from "@/lib/utils";
import { getCustomIndicators } from "@/lib/tradingview/custom-indicators";
import type {
  IChartingLibraryWidget,
  ResolutionString,
  ChartingLibraryWidgetOptions,
} from "@/types/tradingview";
import type { Resolution, DepthCategory } from "@/lib/api";

const resolutionToTV: Record<Resolution, ResolutionString> = {
  "1": "1",
  "5": "5",
  "15": "15",
  "30": "30",
  "60": "60",
  "240": "240",
  D: "D",
};

const tvToResolution: Record<string, Resolution> = {
  "1": "1",
  "5": "5",
  "15": "15",
  "30": "30",
  "60": "60",
  "240": "240",
  D: "D",
  "1D": "D",
};

interface TradingViewChartProps {
  symbol: string;
  resolution: Resolution;
  className?: string;
  onSymbolChange?: (symbol: string) => void;
  onResolutionChange?: (resolution: Resolution) => void;
  onChartReady?: () => void;
  theme?: "light" | "dark";
  /** Category for depth data (COIN, TOTAL, etc.) */
  depthCategory?: DepthCategory;
}

export function TradingViewChart({
  symbol,
  resolution,
  className,
  onSymbolChange,
  onResolutionChange,
  onChartReady,
  theme = "dark",
  depthCategory = "COIN",
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<IChartingLibraryWidget | null>(null);
  const isInitializing = useRef(false);

  const currentSymbol = useRef(symbol);
  const currentResolution = useRef(resolution);

  useEffect(() => {
    currentSymbol.current = symbol;
    currentResolution.current = resolution;
  }, [symbol, resolution]);

  const initWidget = useCallback(() => {
    if (!containerRef.current) return;
    if (isInitializing.current) return;
    if (typeof window === "undefined" || !window.TradingView) return;

    if (!symbol) {
      console.warn("[TradingView] Symbol is missing, skipping init");
      return;
    }

    isInitializing.current = true;

    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (e) {
        console.warn(e);
      }
      widgetRef.current = null;
    }

    const tvResolution = resolutionToTV[resolution] || "15";
    const datafeed = getDatafeed();

    // Set depth category for datafeed
    datafeed.setDepthCategory(depthCategory);

    // Initialize depth cache
    getDepthCache();

    // Using type assertion because custom_indicators_getter is part of TradingView API
    // but may not be in the type definitions
    const widgetOptions = {
      container: containerRef.current,
      symbol: symbol,
      interval: tvResolution,
      datafeed: datafeed,
      library_path: "/charting_library/",
      locale: "ru",
      disabled_features: [
        "use_localstorage_for_settings",
        // Показываем header с кнопкой индикаторов
        "header_compare",
        "header_undo_redo",
        "header_screenshot",
        "popup_hints",
      ],
      enabled_features: [
        "hide_left_toolbar_by_default",
        "items_favoriting", // Избранные индикаторы
      ],
      client_id: "tradingview.com",
      user_id: "public_user_id",
      fullscreen: false,
      autosize: true,
      theme: theme,
      custom_indicators_getter: getCustomIndicators,
      custom_css_url: "/charting_library/tradingview-custom.css",
      debug: false,
    } as ChartingLibraryWidgetOptions;

    try {
      const widget = new window.TradingView.widget(widgetOptions);
      widgetRef.current = widget;

      widget.onChartReady(() => {
        console.log("[TradingView] ✅ Chart Ready");
        isInitializing.current = false;

        const chart = widget.activeChart();

        // Кастомные индикаторы (BidAskDepth, BidAskDiff, DisbalancedDepth)
        // доступны через кнопку "Индикаторы" в панели инструментов.
        // Пользователь добавляет их вручную через UI.

        chart.onSymbolChanged().subscribe(null, () => {
          const newSym = chart.symbol();
          if (newSym !== currentSymbol.current) {
            onSymbolChange?.(newSym);
          }
        });

        chart.onIntervalChanged().subscribe(null, () => {
          const newRes = chart.resolution();
          const mapped = tvToResolution[newRes];
          if (mapped) onResolutionChange?.(mapped);
        });

        onChartReady?.();
      });
    } catch (error) {
      console.error("[TradingView] ❌ CRASH:", error);
      isInitializing.current = false;
    }
  }, [
    symbol,
    resolution,
    theme,
    depthCategory,
    onSymbolChange,
    onResolutionChange,
    onChartReady,
  ]);

  useEffect(() => {
    if (window.TradingView) {
      initWidget();
      return;
    }
    const checkInterval = setInterval(() => {
      if (window.TradingView) {
        clearInterval(checkInterval);
        initWidget();
      }
    }, 100);
    return () => clearInterval(checkInterval);
  }, [initWidget]);

  // Update props effects
  useEffect(() => {
    if (!widgetRef.current || isInitializing.current) return;
    try {
      const chart = widgetRef.current.activeChart();
      if (chart.symbol() !== symbol) chart.setSymbol(symbol);
    } catch (e) {
      console.warn(e);
    }
  }, [symbol]);

  useEffect(() => {
    if (!widgetRef.current || isInitializing.current) return;
    try {
      const chart = widgetRef.current.activeChart();
      const tvRes = resolutionToTV[resolution];
      if (chart.resolution() !== tvRes) chart.setResolution(tvRes);
    } catch (e) {
      console.warn(e);
    }
  }, [resolution]);

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full bg-background-primary relative", className)}
      id="tv_chart_container"
    />
  );
}
