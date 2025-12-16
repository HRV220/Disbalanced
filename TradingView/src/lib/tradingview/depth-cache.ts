/**
 * Depth Data Cache for TradingView Custom Indicators
 *
 * Stores depth data globally so custom studies can access it synchronously.
 * Data is loaded when chart requests bars and stored by time.
 * Supports multiple categories (COIN, TOTAL, etc.) simultaneously.
 */

import { apiClient, type DepthPoint, type Resolution, type DepthCategory } from '@/lib/api';
import type { DepthLevel } from '@/types/indicator';

// ============================================
// Types
// ============================================

export interface DepthCacheEntry {
  time: number;
  bid: Record<DepthLevel, number>;
  ask: Record<DepthLevel, number>;
}

interface CategoryCache {
  data: Map<number, DepthCacheEntry>;
  loading: boolean;
  lastUpdate: number;
}

interface CacheState {
  symbol: string;
  resolution: Resolution;
  categories: Map<DepthCategory, CategoryCache>;
}

// ============================================
// Depth Cache Class
// ============================================

class DepthDataCache {
  private cache: CacheState = {
    symbol: '',
    resolution: '1',
    categories: new Map(),
  };

  private subscribers: Set<() => void> = new Set();

  // Store pending load requests
  private pendingLoads: Map<DepthCategory, { from: number; to: number }> = new Map();

  /**
   * Get or create category cache
   */
  private getCategoryCache(category: DepthCategory): CategoryCache {
    if (!this.cache.categories.has(category)) {
      this.cache.categories.set(category, {
        data: new Map(),
        loading: false,
        lastUpdate: 0,
      });
    }
    return this.cache.categories.get(category)!;
  }

  /**
   * Load depth data for a symbol, category and time range
   */
  async loadDepthData(
    symbol: string,
    category: DepthCategory,
    resolution: Resolution,
    from: number,
    to: number
  ): Promise<void> {
    const catCache = this.getCategoryCache(category);
    const now = Date.now();

    // Skip if same params and recent data
    if (
      this.cache.symbol === symbol &&
      this.cache.resolution === resolution &&
      catCache.data.size > 0 &&
      now - catCache.lastUpdate < 30000 // 30 sec cache
    ) {
      console.log(`[DepthCache] Using cached data for ${category}`);
      return;
    }

    if (catCache.loading) {
      console.log(`[DepthCache] Already loading ${category}...`);
      return;
    }

    catCache.loading = true;
    console.log(`[DepthCache] Loading depth for ${symbol} (${category}, ${resolution})`);

    try {
      const response = await apiClient.getDepth({
        symbol,
        category,
        resolution,
        from,
        to,
      });

      // Clear old data if symbol changed
      if (this.cache.symbol !== symbol) {
        catCache.data.clear();
      }

      // Update cache state
      this.cache.symbol = symbol;
      this.cache.resolution = resolution;
      catCache.lastUpdate = now;

      // Store data by time
      for (const point of response.points) {
        const entry = this.convertDepthPoint(point);
        catCache.data.set(entry.time, entry);
      }

      console.log(`[DepthCache] Loaded ${response.points.length} depth points for ${category}`);
      this.notifySubscribers();
    } catch (error) {
      console.error(`[DepthCache] Failed to load depth data for ${category}:`, error);
    } finally {
      catCache.loading = false;
    }
  }

  /**
   * Load multiple categories in parallel
   */
  async loadMultipleCategories(
    symbol: string,
    categories: DepthCategory[],
    resolution: Resolution,
    from: number,
    to: number
  ): Promise<void> {
    const loadPromises = categories.map(category =>
      this.loadDepthData(symbol, category, resolution, from, to)
    );
    await Promise.all(loadPromises);
  }

  /**
   * Convert API DepthPoint to cache entry
   */
  private convertDepthPoint(point: DepthPoint): DepthCacheEntry {
    return {
      time: point.time,
      bid: {
        '1.5': point.bid_1_5 || 0,
        '3': point.bid_3 || 0,
        '5': point.bid_5 || 0,
        '8': point.bid_8 || 0,
        '15': point.bid_15 || 0,
        '30': point.bid_30 || 0,
      },
      ask: {
        '1.5': point.ask_1_5 || 0,
        '3': point.ask_3 || 0,
        '5': point.ask_5 || 0,
        '8': point.ask_8 || 0,
        '15': point.ask_15 || 0,
        '30': point.ask_30 || 0,
      },
    };
  }

  /**
   * Get depth data for a specific time and category
   * Returns null if no data available
   */
  getDepthAtTime(time: number, category: DepthCategory = 'COIN'): DepthCacheEntry | null {
    const catCache = this.cache.categories.get(category);
    if (!catCache) return null;

    // Try exact match first
    if (catCache.data.has(time)) {
      return catCache.data.get(time)!;
    }

    // Find closest time (within 5 minutes tolerance)
    const tolerance = 5 * 60 * 1000; // 5 minutes
    let closest: DepthCacheEntry | null = null;
    let minDiff = Infinity;

    for (const [t, entry] of catCache.data) {
      const diff = Math.abs(t - time);
      if (diff < minDiff && diff <= tolerance) {
        minDiff = diff;
        closest = entry;
      }
    }

    return closest;
  }

  /**
   * Get depth data by bar index (for TradingView studies)
   * Index 0 = most recent bar
   */
  getDepthByIndex(index: number, category: DepthCategory = 'COIN'): DepthCacheEntry | null {
    const catCache = this.cache.categories.get(category);
    if (!catCache) return null;

    const times = Array.from(catCache.data.keys()).sort((a, b) => b - a);
    if (index >= 0 && index < times.length) {
      return catCache.data.get(times[index]) || null;
    }
    return null;
  }

  /**
   * Get all depth data sorted by time for a category
   */
  getAllDepthData(category: DepthCategory = 'COIN'): DepthCacheEntry[] {
    const catCache = this.cache.categories.get(category);
    if (!catCache) return [];

    return Array.from(catCache.data.values())
      .sort((a, b) => a.time - b.time);
  }

  /**
   * Get BID value for specific depth, time and category
   */
  getBid(time: number, depth: DepthLevel, category: DepthCategory = 'COIN'): number {
    const entry = this.getDepthAtTime(time, category);
    return entry?.bid[depth] || 0;
  }

  /**
   * Get ASK value for specific depth, time and category
   */
  getAsk(time: number, depth: DepthLevel, category: DepthCategory = 'COIN'): number {
    const entry = this.getDepthAtTime(time, category);
    return entry?.ask[depth] || 0;
  }

  /**
   * Get current symbol
   */
  getSymbol(): string {
    return this.cache.symbol;
  }

  /**
   * Get cache size for a category
   */
  getSize(category: DepthCategory = 'COIN'): number {
    const catCache = this.cache.categories.get(category);
    return catCache?.data.size || 0;
  }

  /**
   * Get total cache size across all categories
   */
  getTotalSize(): number {
    let total = 0;
    for (const catCache of this.cache.categories.values()) {
      total += catCache.data.size;
    }
    return total;
  }

  /**
   * Check if loading for a category
   */
  isLoading(category: DepthCategory = 'COIN'): boolean {
    const catCache = this.cache.categories.get(category);
    return catCache?.loading || false;
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.categories.clear();
    this.cache.symbol = '';
    this.notifySubscribers();
  }

  /**
   * Clear data for a specific category
   */
  clearCategory(category: DepthCategory): void {
    this.cache.categories.delete(category);
    this.notifySubscribers();
  }

  /**
   * Subscribe to cache updates
   */
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(cb => cb());
  }
}

// ============================================
// Singleton Instance
// ============================================

let depthCacheInstance: DepthDataCache | null = null;

export function getDepthCache(): DepthDataCache {
  if (!depthCacheInstance) {
    depthCacheInstance = new DepthDataCache();
  }
  return depthCacheInstance;
}

// Expose globally for TradingView custom indicators
if (typeof window !== 'undefined') {
  (window as any).__depthCache = getDepthCache();
}

export function resetDepthCache(): void {
  if (depthCacheInstance) {
    depthCacheInstance.clear();
  }
  depthCacheInstance = null;
}
