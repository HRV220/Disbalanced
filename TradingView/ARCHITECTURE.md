# Disbalanced Project - Frontend Architecture

## Обзор

Disbalanced — это профессиональная платформа для анализа криптовалютного рынка на основе данных Order Book (стакана). Платформа предоставляет уникальные индикаторы глубины рынка для трейдеров.

## Технологический стек

### Core

- **Next.js 14** (App Router) — SSR/SSG, маршрутизация, API routes
- **TypeScript 5.x** — строгая типизация
- **TailwindCSS 3.x** — утилитарные стили
- **Zustand 4.x** — легковесный state management

### Charting

- **TradingView Charting Library** — профессиональные графики
  - Версия: 30.1.0
  - Лицензия: требуется получить от TradingView
  - Custom Studies API для кастомных индикаторов

### Data Layer

- **TanStack Query 5.x** — кэширование, синхронизация серверных данных
- **WebSocket** — real-time обновления (интервал 1 минута)
- **Axios** — HTTP клиент

### Authentication

- **NextAuth.js 5.x** — авторизация
- JWT токены с refresh

### UI Components

- **Radix UI** — доступные примитивы (Dialog, Dropdown, Checkbox)
- **Lucide React** — иконки
- **class-variance-authority** — варианты компонентов

---

## Структура проекта

```
disbalanced/
├── public/
│   ├── charting_library/          # TradingView Charting Library (статические файлы)
│   │   ├── charting_library.standalone.js
│   │   ├── bundles/
│   │   └── ...
│   └── images/
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (marketing)/            # Публичные страницы
│   │   │   ├── page.tsx            # Landing page
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (auth)/                 # Аутентификация
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/            # Защищённые страницы
│   │   │   ├── charts/             # Главная страница графиков
│   │   │   │   └── page.tsx
│   │   │   ├── profile/            # Личный кабинет
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── admin/                  # Админ-панель
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── users/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── symbols/
│   │   │   │   └── route.ts
│   │   │   ├── indicators/
│   │   │   │   ├── depth/
│   │   │   │   │   └── route.ts
│   │   │   │   └── [type]/
│   │   │   │       └── route.ts
│   │   │   ├── presets/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   └── admin/
│   │   │       └── users/
│   │   │           └── route.ts
│   │   │
│   │   ├── layout.tsx              # Root layout
│   │   ├── globals.css
│   │   └── providers.tsx           # Client providers
│   │
│   ├── components/
│   │   ├── charts/                 # Компоненты графиков
│   │   │   ├── TradingViewChart.tsx
│   │   │   ├── ChartContainer.tsx
│   │   │   ├── ChartToolbar.tsx
│   │   │   ├── SymbolSelector.tsx
│   │   │   ├── TimeframeSelector.tsx
│   │   │   ├── IndicatorPanel.tsx
│   │   │   ├── IndicatorSettingsModal.tsx
│   │   │   ├── PresetSelector.tsx
│   │   │   ├── PresetSaveModal.tsx
│   │   │   └── DrawingToolsPanel.tsx
│   │   │
│   │   ├── layout/                 # Layout компоненты
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── ui/                     # Базовые UI компоненты
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── auth/                   # Auth компоненты
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   └── admin/                  # Admin компоненты
│   │       ├── UsersTable.tsx
│   │       ├── UserSubscriptionModal.tsx
│   │       └── SearchInput.tsx
│   │
│   ├── features/                   # Feature modules
│   │   ├── indicators/
│   │   │   ├── types.ts
│   │   │   ├── constants.ts
│   │   │   ├── utils/
│   │   │   │   ├── calculations.ts
│   │   │   │   └── formatters.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useIndicatorData.ts
│   │   │   │   └── useIndicatorSettings.ts
│   │   │   └── components/
│   │   │       └── IndicatorLegend.tsx
│   │   │
│   │   ├── presets/
│   │   │   ├── types.ts
│   │   │   ├── hooks/
│   │   │   │   └── usePresets.ts
│   │   │   └── api.ts
│   │   │
│   │   └── symbols/
│   │       ├── types.ts
│   │       ├── hooks/
│   │       │   └── useSymbols.ts
│   │       └── api.ts
│   │
│   ├── lib/                        # Утилиты и конфигурации
│   │   ├── tradingview/
│   │   │   ├── datafeed.ts         # Datafeed API implementation
│   │   │   ├── config.ts           # Widget Constructor config
│   │   │   ├── custom-indicators.ts # Custom studies
│   │   │   └── types.ts
│   │   ├── api/
│   │   │   ├── client.ts           # Axios instance
│   │   │   └── endpoints.ts
│   │   ├── websocket/
│   │   │   ├── client.ts
│   │   │   └── handlers.ts
│   │   ├── auth/
│   │   │   └── options.ts          # NextAuth config
│   │   └── utils/
│   │       ├── cn.ts               # classNames utility
│   │       ├── format.ts
│   │       └── date.ts
│   │
│   ├── stores/                     # Zustand stores
│   │   ├── chartStore.ts
│   │   ├── indicatorStore.ts
│   │   ├── presetStore.ts
│   │   └── userStore.ts
│   │
│   ├── types/                      # Глобальные TypeScript типы
│   │   ├── api.ts
│   │   ├── chart.ts
│   │   ├── indicator.ts
│   │   ├── preset.ts
│   │   ├── user.ts
│   │   └── tradingview.d.ts        # TradingView type declarations
│   │
│   ├── hooks/                      # Глобальные хуки
│   │   ├── useWebSocket.ts
│   │   ├── useMediaQuery.ts
│   │   └── useDebounce.ts
│   │
│   └── middleware.ts               # Next.js middleware (auth protection)
│
├── .env.local                      # Environment variables
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Типы данных

### Индикаторы

```typescript
// types/indicator.ts

/** Доступные глубины стакана */
export type DepthLevel = "1.5" | "3" | "5" | "8" | "15" | "30";

/** Все доступные глубины */
export const DEPTH_LEVELS: DepthLevel[] = ["1.5", "3", "5", "8", "15", "30"];

/** Типы индикаторов */
export type IndicatorType =
  | "BID_ASK" // Глубина рынка (основной)
  | "DIV" // Диф (разница BID - ASK)
  | "DELTA" // Delta (BID / ASK)
  | "AVG" // Общий AVG (среднее по всем монетам)
  | "BID_ASK_TOTAL" // BID/ASK TOTAL (сумма по всем парам)
  | "D_TOTAL" // D TOTAL (delta по всему рынку)
  | "FUNDING"; // Ставка фандинга

/** Категории агрегации данных */
export type CoinCategory =
  | "COIN" // Конкретная торговая пара
  | "TOTAL" // Все пары
  | "TOTAL1" // Все, кроме BTC
  | "TOTAL2" // Все, кроме BTC и ETH
  | "TOTAL3" // Все, кроме BTC, ETH и SOL
  | "OTHERS"; // Все, кроме топ-10

/** Смешанный DIFF (разные глубины для BID и ASK) */
export interface MixedDiff {
  id: string;
  bidDepth: DepthLevel;
  askDepth: DepthLevel;
  enabled: boolean;
  color: string;
}

/** Предустановленные смешанные DIFF */
export const MIXED_DIFFS: Omit<MixedDiff, "enabled" | "color">[] = [
  { id: "3B-8A", bidDepth: "3", askDepth: "8" },
  { id: "8B-3A", bidDepth: "8", askDepth: "3" },
  { id: "8A-3B", bidDepth: "3", askDepth: "8" }, // same as 3B-8A but negative
  { id: "8B-30A", bidDepth: "8", askDepth: "30" },
  { id: "5B-15A", bidDepth: "5", askDepth: "15" },
  { id: "15B-5A", bidDepth: "15", askDepth: "5" },
  { id: "8B-15A", bidDepth: "8", askDepth: "15" },
  { id: "15B-8A", bidDepth: "15", askDepth: "8" },
  { id: "15B-30A", bidDepth: "15", askDepth: "30" },
  { id: "30B-15A", bidDepth: "30", askDepth: "15" },
];

/** Настройки индикатора BID/ASK */
export interface BidAskIndicatorConfig {
  id: string;
  type: "BID_ASK";
  name: string;
  category: CoinCategory;

  // Включённые компоненты
  bids: DepthLevel[];
  asks: DepthLevel[];
  diffs: DepthLevel[];
  mixedDiffs: MixedDiff[];

  // Цвета линий
  colors: {
    bids: Record<DepthLevel, string>;
    asks: Record<DepthLevel, string>;
    diffs: Record<DepthLevel, string>;
  };

  // Отображение
  visible: boolean;
  expanded: boolean;
}

/** Данные одной точки индикатора */
export interface IndicatorDataPoint {
  timestamp: number; // Unix timestamp в миллисекундах

  // Объёмы BID по глубинам (в USD)
  bid_1_5?: number;
  bid_3?: number;
  bid_5?: number;
  bid_8?: number;
  bid_15?: number;
  bid_30?: number;

  // Объёмы ASK по глубинам (в USD)
  ask_1_5?: number;
  ask_3?: number;
  ask_5?: number;
  ask_8?: number;
  ask_15?: number;
  ask_30?: number;
}

/** Рассчитанные значения для отображения */
export interface CalculatedIndicatorValues extends IndicatorDataPoint {
  // DIV (разница)
  diff_1_5?: number;
  diff_3?: number;
  diff_5?: number;
  diff_8?: number;
  diff_15?: number;
  diff_30?: number;

  // Смешанные DIV
  [key: `diff_${string}`]: number | undefined;
}
```

### Пресеты

```typescript
// types/preset.ts

export interface Preset {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;

  // Состояние графика
  symbol: string;
  timeframe: string;

  // Настройки индикаторов
  indicators: IndicatorConfig[];

  // Позиция разделителя панелей
  panelHeights?: {
    chart: number;
    indicator: number;
  };
}

export interface PresetCreateInput {
  name: string;
  symbol: string;
  timeframe: string;
  indicators: IndicatorConfig[];
}
```

### Пользователи

```typescript
// types/user.ts

export interface User {
  id: string;
  email: string;
  createdAt: string;

  // Подписка
  subscription: {
    active: boolean;
    expiresAt: string | null;
  };
}

export interface AdminUser extends User {
  lastLoginAt: string | null;
}
```

---

## State Management (Zustand)

### Chart Store

```typescript
// stores/chartStore.ts

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface ChartState {
  // Текущий символ
  symbol: string;
  exchange: string;

  // Таймфрейм
  timeframe: string;

  // UI состояние
  isLoading: boolean;
  error: string | null;

  // Размеры панелей (в процентах)
  chartHeight: number;
  indicatorHeight: number;

  // Actions
  setSymbol: (symbol: string, exchange?: string) => void;
  setTimeframe: (timeframe: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPanelHeights: (chart: number, indicator: number) => void;
}

export const useChartStore = create<ChartState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        symbol: "BTCUSDT",
        exchange: "Binance",
        timeframe: "15",
        isLoading: false,
        error: null,
        chartHeight: 65,
        indicatorHeight: 35,

        // Actions
        setSymbol: (symbol, exchange = "Binance") => set({ symbol, exchange }),
        setTimeframe: (timeframe) => set({ timeframe }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setPanelHeights: (chartHeight, indicatorHeight) =>
          set({ chartHeight, indicatorHeight }),
      }),
      {
        name: "chart-storage",
        partialize: (state) => ({
          symbol: state.symbol,
          exchange: state.exchange,
          timeframe: state.timeframe,
          chartHeight: state.chartHeight,
          indicatorHeight: state.indicatorHeight,
        }),
      }
    )
  )
);
```

### Indicator Store

```typescript
// stores/indicatorStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { BidAskIndicatorConfig, DepthLevel } from "@/types/indicator";

interface IndicatorState {
  // Активные индикаторы
  indicators: BidAskIndicatorConfig[];

  // Actions
  addIndicator: (type: IndicatorType) => void;
  removeIndicator: (id: string) => void;
  updateIndicator: (
    id: string,
    updates: Partial<BidAskIndicatorConfig>
  ) => void;

  // Быстрые toggles
  toggleBid: (indicatorId: string, depth: DepthLevel) => void;
  toggleAsk: (indicatorId: string, depth: DepthLevel) => void;
  toggleDiff: (indicatorId: string, depth: DepthLevel) => void;
  toggleMixedDiff: (indicatorId: string, mixedDiffId: string) => void;

  // Visibility
  toggleVisibility: (id: string) => void;
  toggleExpanded: (id: string) => void;

  // Сброс
  resetToDefault: () => void;
  loadFromPreset: (indicators: BidAskIndicatorConfig[]) => void;
}

const DEFAULT_INDICATOR: BidAskIndicatorConfig = {
  id: "default",
  type: "BID_ASK",
  name: "BID/ASK SPOT COIN",
  category: "COIN",
  bids: ["3"],
  asks: ["3"],
  diffs: [],
  mixedDiffs: [],
  colors: {
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
      "1.5": "#3b82f6",
      "3": "#2563eb",
      "5": "#1d4ed8",
      "8": "#1e40af",
      "15": "#1e3a8a",
      "30": "#172554",
    },
  },
  visible: true,
  expanded: true,
};

export const useIndicatorStore = create<IndicatorState>()(
  devtools((set) => ({
    indicators: [DEFAULT_INDICATOR],

    addIndicator: (type) =>
      set((state) => ({
        indicators: [
          ...state.indicators,
          {
            ...DEFAULT_INDICATOR,
            id: `indicator-${Date.now()}`,
            name: `${type} Indicator`,
          },
        ],
      })),

    removeIndicator: (id) =>
      set((state) => ({
        indicators: state.indicators.filter((i) => i.id !== id),
      })),

    updateIndicator: (id, updates) =>
      set((state) => ({
        indicators: state.indicators.map((i) =>
          i.id === id ? { ...i, ...updates } : i
        ),
      })),

    toggleBid: (indicatorId, depth) =>
      set((state) => ({
        indicators: state.indicators.map((i) => {
          if (i.id !== indicatorId) return i;
          const bids = i.bids.includes(depth)
            ? i.bids.filter((d) => d !== depth)
            : [...i.bids, depth];
          return { ...i, bids };
        }),
      })),

    toggleAsk: (indicatorId, depth) =>
      set((state) => ({
        indicators: state.indicators.map((i) => {
          if (i.id !== indicatorId) return i;
          const asks = i.asks.includes(depth)
            ? i.asks.filter((d) => d !== depth)
            : [...i.asks, depth];
          return { ...i, asks };
        }),
      })),

    toggleDiff: (indicatorId, depth) =>
      set((state) => ({
        indicators: state.indicators.map((i) => {
          if (i.id !== indicatorId) return i;
          const diffs = i.diffs.includes(depth)
            ? i.diffs.filter((d) => d !== depth)
            : [...i.diffs, depth];
          return { ...i, diffs };
        }),
      })),

    toggleMixedDiff: (indicatorId, mixedDiffId) =>
      set((state) => ({
        indicators: state.indicators.map((i) => {
          if (i.id !== indicatorId) return i;
          const mixedDiffs = i.mixedDiffs.map((md) =>
            md.id === mixedDiffId ? { ...md, enabled: !md.enabled } : md
          );
          return { ...i, mixedDiffs };
        }),
      })),

    toggleVisibility: (id) =>
      set((state) => ({
        indicators: state.indicators.map((i) =>
          i.id === id ? { ...i, visible: !i.visible } : i
        ),
      })),

    toggleExpanded: (id) =>
      set((state) => ({
        indicators: state.indicators.map((i) =>
          i.id === id ? { ...i, expanded: !i.expanded } : i
        ),
      })),

    resetToDefault: () => set({ indicators: [DEFAULT_INDICATOR] }),

    loadFromPreset: (indicators) => set({ indicators }),
  }))
);
```

---

## TradingView Integration

### Datafeed Implementation

```typescript
// lib/tradingview/datafeed.ts

import {
  IBasicDataFeed,
  LibrarySymbolInfo,
  ResolutionString,
  SearchSymbolResultItem,
  HistoryCallback,
  SubscribeBarsCallback,
  DatafeedConfiguration,
  Bar,
} from "@/types/tradingview";
import { apiClient } from "@/lib/api/client";

const configurationData: DatafeedConfiguration = {
  supported_resolutions: [
    "1",
    "5",
    "15",
    "30",
    "60",
    "240",
    "1D",
    "1W",
  ] as ResolutionString[],
  exchanges: [{ value: "Binance", name: "Binance", desc: "Binance SPOT" }],
  symbols_types: [{ name: "Crypto", value: "crypto" }],
};

class Datafeed implements IBasicDataFeed {
  private subscribers: Map<
    string,
    {
      callback: SubscribeBarsCallback;
      symbolInfo: LibrarySymbolInfo;
      resolution: ResolutionString;
    }
  > = new Map();

  private wsConnection: WebSocket | null = null;
  private lastBars: Map<string, Bar> = new Map();

  onReady(callback: (config: DatafeedConfiguration) => void): void {
    setTimeout(() => callback(configurationData), 0);
  }

  async searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResult: (items: SearchSymbolResultItem[]) => void
  ): Promise<void> {
    try {
      const { data } = await apiClient.get("/api/symbols/search", {
        params: { query: userInput, exchange },
      });
      onResult(data);
    } catch (error) {
      console.error("Symbol search failed:", error);
      onResult([]);
    }
  }

  async resolveSymbol(
    symbolName: string,
    onResolve: (symbolInfo: LibrarySymbolInfo) => void,
    onError: (reason: string) => void
  ): Promise<void> {
    try {
      const { data } = await apiClient.get(`/api/symbols/${symbolName}`);

      const symbolInfo: LibrarySymbolInfo = {
        ticker: data.symbol,
        name: data.symbol,
        description: data.description,
        type: "crypto",
        session: "24x7",
        timezone: "Etc/UTC",
        exchange: data.exchange,
        minmov: 1,
        pricescale: data.pricescale || 100,
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: true,
        supported_resolutions: configurationData.supported_resolutions!,
        volume_precision: 2,
        data_status: "streaming",
      };

      onResolve(symbolInfo);
    } catch (error) {
      onError("Symbol not found");
    }
  }

  async getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: { from: number; to: number; firstDataRequest: boolean },
    onResult: HistoryCallback,
    onError: (reason: string) => void
  ): Promise<void> {
    try {
      const { data } = await apiClient.get("/api/candles", {
        params: {
          symbol: symbolInfo.ticker,
          resolution,
          from: periodParams.from,
          to: periodParams.to,
        },
      });

      if (!data.bars || data.bars.length === 0) {
        onResult([], { noData: true });
        return;
      }

      const bars: Bar[] = data.bars.map((bar: any) => ({
        time: bar.time * 1000, // Convert to milliseconds
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close,
        volume: bar.volume,
      }));

      if (periodParams.firstDataRequest && bars.length > 0) {
        this.lastBars.set(symbolInfo.ticker!, bars[bars.length - 1]);
      }

      onResult(bars, { noData: false });
    } catch (error) {
      onError("Failed to load bars");
    }
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void
  ): void {
    this.subscribers.set(listenerGuid, {
      callback: onTick,
      symbolInfo,
      resolution,
    });

    this.ensureWebSocketConnection();
  }

  unsubscribeBars(listenerGuid: string): void {
    this.subscribers.delete(listenerGuid);

    if (this.subscribers.size === 0 && this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  private ensureWebSocketConnection(): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/ws";
    this.wsConnection = new WebSocket(wsUrl);

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleRealtimeUpdate(data);
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    this.wsConnection.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.wsConnection.onclose = () => {
      // Reconnect after 5 seconds
      setTimeout(() => this.ensureWebSocketConnection(), 5000);
    };
  }

  private handleRealtimeUpdate(data: any): void {
    this.subscribers.forEach(({ callback, symbolInfo }) => {
      if (data.symbol === symbolInfo.ticker) {
        const bar: Bar = {
          time: data.time * 1000,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: data.volume,
        };
        callback(bar);
      }
    });
  }
}

export const datafeed = new Datafeed();
```

### Widget Configuration

```typescript
// lib/tradingview/config.ts

import { ChartingLibraryWidgetOptions } from "@/types/tradingview";
import { datafeed } from "./datafeed";

export function getWidgetConfig(
  container: HTMLElement,
  symbol: string,
  interval: string
): Partial<ChartingLibraryWidgetOptions> {
  return {
    container,
    datafeed,
    symbol,
    interval: interval as any,
    library_path: "/charting_library/",
    locale: "ru",
    fullscreen: false,
    autosize: true,

    // Тема
    theme: "dark",
    custom_css_url: "/tradingview-custom.css",

    // Disabled features
    disabled_features: [
      "header_symbol_search",
      "header_compare",
      "header_undo_redo",
      "header_screenshot",
      "header_fullscreen_button",
      "use_localstorage_for_settings",
      "popup_hints",
    ],

    // Enabled features
    enabled_features: ["study_templates", "hide_left_toolbar_by_default"],

    // Toolbar settings
    drawings_access: {
      type: "black",
      tools: [{ name: "Trend Line" }, { name: "Horizontal Line" }],
    },

    // Overrides
    overrides: {
      "paneProperties.background": "#0a0b0d",
      "paneProperties.backgroundType": "solid",
      "scalesProperties.backgroundColor": "#0a0b0d",
      "mainSeriesProperties.candleStyle.upColor": "#00c853",
      "mainSeriesProperties.candleStyle.downColor": "#ff5252",
      "mainSeriesProperties.candleStyle.borderUpColor": "#00c853",
      "mainSeriesProperties.candleStyle.borderDownColor": "#ff5252",
      "mainSeriesProperties.candleStyle.wickUpColor": "#00c853",
      "mainSeriesProperties.candleStyle.wickDownColor": "#ff5252",
    },

    // Loading screen
    loading_screen: {
      backgroundColor: "#0a0b0d",
      foregroundColor: "#448aff",
    },

    // Time settings
    timezone: "Europe/Moscow",

    // Study settings
    studies_overrides: {},
  };
}
```

---

## API Endpoints

### Symbols API

```typescript
// app/api/symbols/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const exchange = searchParams.get("exchange") || "Binance";

  // В реальном приложении — запрос к БД или внешнему API
  const symbols = [
    { symbol: "BTCUSDT", description: "Bitcoin / USDT", exchange: "Binance" },
    { symbol: "ETHUSDT", description: "Ethereum / USDT", exchange: "Binance" },
    { symbol: "SOLUSDT", description: "Solana / USDT", exchange: "Binance" },
    // ... other symbols
  ];

  return NextResponse.json(symbols);
}
```

### Indicators API

```typescript
// app/api/indicators/depth/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check subscription
  if (!session.user.subscription?.active) {
    return NextResponse.json(
      { error: "Subscription required" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const timeframe = searchParams.get("timeframe") || "15";

  if (!symbol || !from || !to) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Fetch indicator data from backend
  // В реальном приложении — запрос к сервису сбора данных
  const data = await fetchIndicatorData(
    symbol,
    Number(from),
    Number(to),
    timeframe
  );

  return NextResponse.json(data);
}

async function fetchIndicatorData(
  symbol: string,
  from: number,
  to: number,
  timeframe: string
) {
  // Implementation: fetch from your data service
  return {
    symbol,
    timeframe,
    points: [], // IndicatorDataPoint[]
  };
}
```

### Presets API

```typescript
// app/api/presets/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

// GET - List user's presets
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch presets from database
  const presets = await db.preset.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(presets);
}

// POST - Create new preset
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const preset = await db.preset.create({
    data: {
      name: body.name,
      userId: session.user.id,
      symbol: body.symbol,
      timeframe: body.timeframe,
      indicators: body.indicators,
    },
  });

  return NextResponse.json(preset, { status: 201 });
}
```

---

## Компонентная архитектура страницы графиков

```
┌────────────────────────────────────────────────────────────────────┐
│                           Header                                    │
│  [Logo] [Главная] [График] [Подробнее]           [🌙] [👤 User]   │
├────────────────────────────────────────────────────────────────────┤
│                         ChartToolbar                                │
│  [BTC/USDT ▼] [$97,234 +2.3%] │ [1м][5м][15м][1ч]... │             │
│                               │ [📊 Индикаторы] [💾 Пресет: ▼]    │
├─────┬──────────────────────────────────────────────────────────────┤
│     │                                                              │
│  D  │                    TradingViewChart                          │
│  r  │                   (Candlestick Chart)                        │
│  a  │                                                              │
│  w  │                                                              │
│  i  │                                                              │
│  n  ├──────────────────────────────────────────────────────────────┤
│  g  │                      ResizeHandle                            │
│     ├──────────────────────────────────────────────────────────────┤
│  T  │                    IndicatorPanel                            │
│  o  │  [BID/ASK SPOT COIN ⚙️ 👁️ ✕]                                │
│  o  │  ════════════════════════════════════════════════════════    │
│  l  │                                                              │
│  s  │              (Custom Indicator Chart - Canvas)               │
│     │                                                              │
│     │  ┌─────────────────────────────────────────────────────────┐ │
│     │  │ Legend: BID 3% ● ASK 3% ● DIFF 3% ●                    │ │
│     │  └─────────────────────────────────────────────────────────┘ │
└─────┴──────────────────────────────────────────────────────────────┘
```

---

## Следующие шаги

1. **Инициализация проекта** — создание Next.js приложения с базовой структурой
2. **UI компоненты** — реализация базовых компонентов (Button, Modal, Dropdown)
3. **TradingView интеграция** — подключение Charting Library
4. **Datafeed** — реализация подключения к данным
5. **Custom Indicators** — создание кастомных индикаторов
6. **Аутентификация** — настройка NextAuth.js
7. **Админ-панель** — управление пользователями
