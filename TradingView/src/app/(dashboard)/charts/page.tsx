"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useChartStore } from "@/stores";
import type { Resolution } from "@/lib/api";

// Dynamic import TradingView to avoid SSR issues
const TradingViewChart = dynamic(
  () =>
    import("@/components/charts/TradingViewChart").then(
      (mod) => mod.TradingViewChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-background-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-foreground-muted border-t-accent-blue rounded-full animate-spin" />
          <span className="text-sm text-foreground-secondary">
            Загрузка графика...
          </span>
        </div>
      </div>
    ),
  }
);

export default function ChartsPage() {
  const { symbol, setSymbol } = useChartStore();

  // Chart settings
  const [resolution, setResolution] = useState<Resolution>("1");

  // Handle symbol change from TradingView
  const handleSymbolChange = useCallback(
    (newSymbol: string) => {
      // Remove exchange prefix if present
      const cleanSymbol = newSymbol.replace(/^BINANCE:/i, "");
      setSymbol(cleanSymbol);
    },
    [setSymbol]
  );

  // Handle resolution change from TradingView
  const handleResolutionChange = useCallback((newResolution: Resolution) => {
    setResolution(newResolution);
  }, []);

  return (
    <div className="h-full w-full overflow-hidden">
      <TradingViewChart
        symbol={symbol}
        resolution={resolution}
        onSymbolChange={handleSymbolChange}
        onResolutionChange={handleResolutionChange}
        className="w-full h-full"
      />
    </div>
  );
}
