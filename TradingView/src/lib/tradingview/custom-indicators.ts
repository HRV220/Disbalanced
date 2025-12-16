/**
 * TradingView Custom Indicators
 *
 * Two separate indicators for different data categories:
 * - BidAskCoin: BID/ASK depth for specific coin (COIN category)
 * - BidAskTotal: BID/ASK depth for total market (TOTAL category)
 *
 * Each indicator has:
 * - 6 BID lines (1.5%, 3%, 5%, 8%, 15%, 30%)
 * - 6 ASK lines (1.5%, 3%, 5%, 8%, 15%, 30%)
 * - 6 DIFF lines (BID-ASK for each depth)
 */

import type { DepthLevel } from '@/types/indicator';
import type { DepthCategory } from '@/lib/api';

// Colors
const COLORS = {
  bid: '#22c55e',      // Green for BID
  ask: '#ef4444',      // Red for ASK
  diff: '#3b82f6',     // Blue for DIFF
};

// Global accessor for depth cache
declare global {
  interface Window {
    __depthCache?: {
      getDepthAtTime(time: number, category?: string): {
        time: number;
        bid: Record<DepthLevel, number>;
        ask: Record<DepthLevel, number>;
      } | null;
      getAllDepthData(category?: string): Array<{
        time: number;
        bid: Record<DepthLevel, number>;
        ask: Record<DepthLevel, number>;
      }>;
      getSize(category?: string): number;
    };
  }
}

// Helper function to get depth data for a bar
function getDepthForBar(
  barTime: number,
  category: DepthCategory
): { bid: Record<DepthLevel, number>; ask: Record<DepthLevel, number> } | null {
  const depthCache = typeof window !== 'undefined' ? window.__depthCache : null;

  if (!depthCache || depthCache.getSize(category) === 0) {
    return null;
  }

  const depthData = depthCache.getDepthAtTime(barTime, category);

  if (depthData) {
    return depthData;
  }

  // Try to get closest data point
  const allData = depthCache.getAllDepthData(category);
  if (allData.length > 0) {
    let closest = allData[0];
    let minDiff = Math.abs(allData[0].time - barTime);

    for (const data of allData) {
      const diff = Math.abs(data.time - barTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = data;
      }
    }

    return closest;
  }

  return null;
}

/**
 * Create indicator configuration for a specific category
 */
function createIndicatorConfig(
  name: string,
  description: string,
  shortDescription: string,
  category: DepthCategory
) {
  return {
    name,
    metainfo: {
      _metainfoVersion: 51,
      id: `${name}@tv-basicstudies-1`,
      name,
      description,
      shortDescription,

      is_price_study: false,
      isCustomIndicator: true,
      linkedToSeries: true,

      format: {
        type: "volume",
        precision: 0,
      },

      defaults: {
        styles: {
          // BID lines (0-5) - Green
          plot_0: { linestyle: 0, linewidth: 1, plottype: 2, color: COLORS.bid, transparency: 20 },
          plot_1: { linestyle: 0, linewidth: 2, plottype: 2, color: COLORS.bid, transparency: 0 },
          plot_2: { linestyle: 0, linewidth: 1, plottype: 2, color: COLORS.bid, transparency: 20 },
          plot_3: { linestyle: 0, linewidth: 1, plottype: 2, color: COLORS.bid, transparency: 30 },
          plot_4: { linestyle: 0, linewidth: 1, plottype: 2, color: COLORS.bid, transparency: 40 },
          plot_5: { linestyle: 0, linewidth: 1, plottype: 2, color: COLORS.bid, transparency: 50 },
          // ASK lines (6-11) - Red
          plot_6: { linestyle: 0, linewidth: 1, plottype: 2, color: COLORS.ask, transparency: 20 },
          plot_7: { linestyle: 0, linewidth: 2, plottype: 2, color: COLORS.ask, transparency: 0 },
          plot_8: { linestyle: 0, linewidth: 1, plottype: 2, color: COLORS.ask, transparency: 20 },
          plot_9: { linestyle: 0, linewidth: 1, plottype: 2, color: COLORS.ask, transparency: 30 },
          plot_10: { linestyle: 0, linewidth: 1, plottype: 2, color: COLORS.ask, transparency: 40 },
          plot_11: { linestyle: 0, linewidth: 1, plottype: 2, color: COLORS.ask, transparency: 50 },
          // DIFF lines (12-17) - Blue
          plot_12: { linestyle: 0, linewidth: 1, plottype: 2, color: COLORS.diff, transparency: 20 },
          plot_13: { linestyle: 0, linewidth: 2, plottype: 2, color: COLORS.diff, transparency: 0 },
          plot_14: { linestyle: 0, linewidth: 1, plottype: 2, color: COLORS.diff, transparency: 20 },
          plot_15: { linestyle: 0, linewidth: 1, plottype: 2, color: COLORS.diff, transparency: 30 },
          plot_16: { linestyle: 0, linewidth: 1, plottype: 2, color: COLORS.diff, transparency: 40 },
          plot_17: { linestyle: 0, linewidth: 1, plottype: 2, color: COLORS.diff, transparency: 50 },
        },
        inputs: {
          // BID checkboxes (default: only 3% enabled)
          showBid15: false,
          showBid3: true,
          showBid5: false,
          showBid8: false,
          showBid15_: false,
          showBid30: false,
          // ASK checkboxes (default: only 3% enabled)
          showAsk15: false,
          showAsk3: true,
          showAsk5: false,
          showAsk8: false,
          showAsk15_: false,
          showAsk30: false,
          // DIFF checkboxes (default: all disabled)
          showDiff15: false,
          showDiff3: false,
          showDiff5: false,
          showDiff8: false,
          showDiff15_: false,
          showDiff30: false,
        },
      },

      inputs: [
        // BID checkboxes
        { id: "showBid15", name: "BID 1.5%", type: "bool", defval: false },
        { id: "showBid3", name: "BID 3%", type: "bool", defval: true },
        { id: "showBid5", name: "BID 5%", type: "bool", defval: false },
        { id: "showBid8", name: "BID 8%", type: "bool", defval: false },
        { id: "showBid15_", name: "BID 15%", type: "bool", defval: false },
        { id: "showBid30", name: "BID 30%", type: "bool", defval: false },
        // ASK checkboxes
        { id: "showAsk15", name: "ASK 1.5%", type: "bool", defval: false },
        { id: "showAsk3", name: "ASK 3%", type: "bool", defval: true },
        { id: "showAsk5", name: "ASK 5%", type: "bool", defval: false },
        { id: "showAsk8", name: "ASK 8%", type: "bool", defval: false },
        { id: "showAsk15_", name: "ASK 15%", type: "bool", defval: false },
        { id: "showAsk30", name: "ASK 30%", type: "bool", defval: false },
        // DIFF checkboxes
        { id: "showDiff15", name: "DIFF 1.5%", type: "bool", defval: false },
        { id: "showDiff3", name: "DIFF 3%", type: "bool", defval: false },
        { id: "showDiff5", name: "DIFF 5%", type: "bool", defval: false },
        { id: "showDiff8", name: "DIFF 8%", type: "bool", defval: false },
        { id: "showDiff15_", name: "DIFF 15%", type: "bool", defval: false },
        { id: "showDiff30", name: "DIFF 30%", type: "bool", defval: false },
      ],

      styles: {
        // BID styles
        plot_0: { title: "BID 1.5%", histogramBase: 0, isHidden: false },
        plot_1: { title: "BID 3%", histogramBase: 0, isHidden: false },
        plot_2: { title: "BID 5%", histogramBase: 0, isHidden: false },
        plot_3: { title: "BID 8%", histogramBase: 0, isHidden: false },
        plot_4: { title: "BID 15%", histogramBase: 0, isHidden: false },
        plot_5: { title: "BID 30%", histogramBase: 0, isHidden: false },
        // ASK styles
        plot_6: { title: "ASK 1.5%", histogramBase: 0, isHidden: false },
        plot_7: { title: "ASK 3%", histogramBase: 0, isHidden: false },
        plot_8: { title: "ASK 5%", histogramBase: 0, isHidden: false },
        plot_9: { title: "ASK 8%", histogramBase: 0, isHidden: false },
        plot_10: { title: "ASK 15%", histogramBase: 0, isHidden: false },
        plot_11: { title: "ASK 30%", histogramBase: 0, isHidden: false },
        // DIFF styles
        plot_12: { title: "DIFF 1.5%", histogramBase: 0, isHidden: false },
        plot_13: { title: "DIFF 3%", histogramBase: 0, isHidden: false },
        plot_14: { title: "DIFF 5%", histogramBase: 0, isHidden: false },
        plot_15: { title: "DIFF 8%", histogramBase: 0, isHidden: false },
        plot_16: { title: "DIFF 15%", histogramBase: 0, isHidden: false },
        plot_17: { title: "DIFF 30%", histogramBase: 0, isHidden: false },
      },

      plots: [
        // BID plots (0-5)
        { id: "plot_0", type: "line" },
        { id: "plot_1", type: "line" },
        { id: "plot_2", type: "line" },
        { id: "plot_3", type: "line" },
        { id: "plot_4", type: "line" },
        { id: "plot_5", type: "line" },
        // ASK plots (6-11)
        { id: "plot_6", type: "line" },
        { id: "plot_7", type: "line" },
        { id: "plot_8", type: "line" },
        { id: "plot_9", type: "line" },
        { id: "plot_10", type: "line" },
        { id: "plot_11", type: "line" },
        // DIFF plots (12-17)
        { id: "plot_12", type: "line" },
        { id: "plot_13", type: "line" },
        { id: "plot_14", type: "line" },
        { id: "plot_15", type: "line" },
        { id: "plot_16", type: "line" },
        { id: "plot_17", type: "line" },
      ],
    },

    constructor: function (this: any) {
      // Store category in closure
      const indicatorCategory = category;

      this.init = function (this: any, context: any, inputCallback: any) {
        this._context = context;
        this._input = inputCallback;
        console.log(`[${name}] Indicator initialized (category: ${indicatorCategory})`);
      };

      this.main = function (this: any, ctx: any, inputCallback: any) {
        // Get current bar time from context
        let barTime = 0;
        try {
          if (ctx.symbol && ctx.symbol.time) {
            barTime = ctx.symbol.time;
          }
        } catch (e) {
          // Fallback
        }

        // Get checkbox values (18 inputs total)
        const showBid15 = inputCallback(0);
        const showBid3 = inputCallback(1);
        const showBid5 = inputCallback(2);
        const showBid8 = inputCallback(3);
        const showBid15_ = inputCallback(4);
        const showBid30 = inputCallback(5);

        const showAsk15 = inputCallback(6);
        const showAsk3 = inputCallback(7);
        const showAsk5 = inputCallback(8);
        const showAsk8 = inputCallback(9);
        const showAsk15_ = inputCallback(10);
        const showAsk30 = inputCallback(11);

        const showDiff15 = inputCallback(12);
        const showDiff3 = inputCallback(13);
        const showDiff5 = inputCallback(14);
        const showDiff8 = inputCallback(15);
        const showDiff15_ = inputCallback(16);
        const showDiff30 = inputCallback(17);

        // Get depth data for this category
        const depthData = getDepthForBar(barTime, indicatorCategory);

        // Default empty values
        const emptyResult = new Array(18).fill(NaN);

        if (!depthData) {
          return emptyResult;
        }

        const { bid, ask } = depthData;

        // Calculate all values
        const result: number[] = [];

        // BID values (0-5)
        result.push(showBid15 ? (bid['1.5'] || 0) : NaN);
        result.push(showBid3 ? (bid['3'] || 0) : NaN);
        result.push(showBid5 ? (bid['5'] || 0) : NaN);
        result.push(showBid8 ? (bid['8'] || 0) : NaN);
        result.push(showBid15_ ? (bid['15'] || 0) : NaN);
        result.push(showBid30 ? (bid['30'] || 0) : NaN);

        // ASK values (6-11) - positive like BID
        result.push(showAsk15 ? (ask['1.5'] || 0) : NaN);
        result.push(showAsk3 ? (ask['3'] || 0) : NaN);
        result.push(showAsk5 ? (ask['5'] || 0) : NaN);
        result.push(showAsk8 ? (ask['8'] || 0) : NaN);
        result.push(showAsk15_ ? (ask['15'] || 0) : NaN);
        result.push(showAsk30 ? (ask['30'] || 0) : NaN);

        // DIFF values (12-17)
        result.push(showDiff15 ? ((bid['1.5'] || 0) - (ask['1.5'] || 0)) : NaN);
        result.push(showDiff3 ? ((bid['3'] || 0) - (ask['3'] || 0)) : NaN);
        result.push(showDiff5 ? ((bid['5'] || 0) - (ask['5'] || 0)) : NaN);
        result.push(showDiff8 ? ((bid['8'] || 0) - (ask['8'] || 0)) : NaN);
        result.push(showDiff15_ ? ((bid['15'] || 0) - (ask['15'] || 0)) : NaN);
        result.push(showDiff30 ? ((bid['30'] || 0) - (ask['30'] || 0)) : NaN);

        return result;
      };
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getCustomIndicators = (_PineJS: any): Promise<any[]> => {
  const indicators: any[] = [
    // BID/ASK for specific coin (COIN category)
    createIndicatorConfig(
      "BidAskCoin",
      "BID/ASK Depth for Coin",
      "BID/ASK Coin",
      "COIN"
    ),

    // BID/ASK for total market (TOTAL category)
    createIndicatorConfig(
      "BidAskTotal",
      "BID/ASK Depth for Total Market",
      "BID/ASK Total",
      "TOTAL"
    ),

    // BID/ASK for total market without BTC (TOTAL1 category)
    createIndicatorConfig(
      "BidAskTotal1",
      "BID/ASK Depth for Total Market (excl. BTC)",
      "BID/ASK Total1",
      "TOTAL1"
    ),

    // BID/ASK for total market without BTC and ETH (TOTAL2 category)
    createIndicatorConfig(
      "BidAskTotal2",
      "BID/ASK Depth for Total Market (excl. BTC, ETH)",
      "BID/ASK Total2",
      "TOTAL2"
    ),

    // BID/ASK for top altcoins (TOTAL3 category)
    createIndicatorConfig(
      "BidAskTotal3",
      "BID/ASK Depth for Top Altcoins",
      "BID/ASK Total3",
      "TOTAL3"
    ),

    // BID/ASK for other coins (OTHERS category)
    createIndicatorConfig(
      "BidAskOthers",
      "BID/ASK Depth for Other Coins",
      "BID/ASK Others",
      "OTHERS"
    ),
  ];

  return Promise.resolve(indicators);
};
