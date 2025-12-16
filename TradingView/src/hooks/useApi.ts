'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  apiClient, 
  apiKeys, 
  type DepthRequestParams,
  type CandlesRequestParams,
  type Resolution,
} from '@/lib/api';

// ============================================
// useSymbols - список торговых пар
// ============================================

export function useSymbols() {
  return useQuery({
    queryKey: apiKeys.symbols,
    queryFn: () => apiClient.getSymbols(),
    staleTime: 5 * 60 * 1000, // 5 минут - список пар меняется редко
    refetchOnWindowFocus: false,
  });
}

// ============================================
// useCandles - OHLCV свечи
// ============================================

export function useCandles(
  params: CandlesRequestParams,
  options?: { enabled?: boolean }
) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: apiKeys.candles(params.symbol, params.resolution, params.from, params.to),
    queryFn: () => apiClient.getCandles(params),
    staleTime: 30 * 1000,         // 30 секунд
    refetchInterval: 60 * 1000,   // Обновлять каждую минуту
    enabled: enabled && 
      !!params.symbol && 
      !!params.resolution && 
      params.from > 0 && 
      params.to > 0,
  });
}

// ============================================
// useLatestCandle - последняя свеча
// ============================================

export function useLatestCandle(
  symbol: string,
  options?: { enabled?: boolean }
) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: apiKeys.latestCandle(symbol),
    queryFn: () => apiClient.getLatestCandle(symbol),
    staleTime: 5 * 1000,          // 5 секунд
    refetchInterval: 5 * 1000,    // Обновлять каждые 5 секунд
    enabled: enabled && !!symbol,
  });
}

// ============================================
// useDepth - данные глубины стакана
// ============================================

export function useDepth(
  params: DepthRequestParams,
  options?: { enabled?: boolean }
) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: apiKeys.depth(params),
    queryFn: () => apiClient.getDepth(params),
    staleTime: 60 * 1000,         // 1 минута
    refetchInterval: 60 * 1000,   // Обновлять каждую минуту
    enabled: enabled && 
      !!params.symbol && 
      !!params.category && 
      !!params.resolution && 
      params.from > 0 && 
      params.to > 0,
  });
}

// ============================================
// useFunding - данные фандинга
// ============================================

export function useFunding(
  symbol: string,
  from: number,
  to: number,
  options?: { enabled?: boolean }
) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: apiKeys.funding(symbol, from, to),
    queryFn: () => apiClient.getFunding(symbol, from, to),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    enabled: enabled && !!symbol && from > 0 && to > 0,
  });
}

// ============================================
// useHealth - проверка здоровья сервиса
// ============================================

export function useHealth(options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: apiKeys.health,
    queryFn: () => apiClient.getHealth(),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    enabled,
  });
}

// ============================================
// useStatus - статус сбора данных
// ============================================

export function useStatus(options?: { enabled?: boolean }) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: apiKeys.status,
    queryFn: () => apiClient.getStatus(),
    staleTime: 10 * 1000,
    refetchInterval: 10 * 1000,
    enabled,
  });
}
