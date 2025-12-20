import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Timeframe, DrawingTool } from "@/types";

// SSR-safe storage - returns undefined on server
const safeStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(name);
    }
  },
};

interface ChartStoreState {
  // Current symbol and timeframe
  symbol: string;
  exchange: string;
  timeframe: Timeframe;

  // Price data
  currentPrice: number | null;
  priceChange24h: number | null;
  priceChangePercent24h: number | null;

  // Drawing tool
  activeTool: DrawingTool;

  // Panel layout (heights in percentages)
  chartHeightPercent: number;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setSymbol: (symbol: string, exchange?: string) => void;
  setTimeframe: (timeframe: Timeframe) => void;
  setPrice: (
    price: number,
    change24h?: number,
    changePercent24h?: number
  ) => void;
  setActiveTool: (tool: DrawingTool) => void;
  setChartHeight: (percent: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  symbol: "BTCUSDT",
  exchange: "Binance",
  timeframe: "1" as Timeframe,
  currentPrice: null,
  priceChange24h: null,
  priceChangePercent24h: null,
  activeTool: "crosshair" as DrawingTool,
  chartHeightPercent: 70,
  isLoading: false,
  error: null,
};

export const useChartStore = create<ChartStoreState>()(
  persist(
    (set) => ({
      ...initialState,

      setSymbol: (symbol, exchange) =>
        set({
          symbol,
          exchange: exchange || "Binance",
          currentPrice: null,
          priceChange24h: null,
          priceChangePercent24h: null,
          error: null,
        }),

      setTimeframe: (timeframe) => set({ timeframe }),

      setPrice: (price, change24h, changePercent24h) =>
        set({
          currentPrice: price,
          priceChange24h: change24h ?? null,
          priceChangePercent24h: changePercent24h ?? null,
        }),

      setActiveTool: (tool) => set({ activeTool: tool }),

      setChartHeight: (percent) =>
        set({ chartHeightPercent: Math.max(30, Math.min(80, percent)) }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: "disbalanced-chart",
      //storage: createJSONStorage(() => safeStorage),
      skipHydration: true, // Prevent hydration mismatch
      partialize: (state) => ({
        symbol: state.symbol,
        exchange: state.exchange,
        timeframe: state.timeframe,
        activeTool: state.activeTool,
        chartHeightPercent: state.chartHeightPercent,
      }),
    }
  )
);
