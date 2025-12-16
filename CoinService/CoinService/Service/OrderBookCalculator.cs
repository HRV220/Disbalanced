using System.Text.Json;
using APIBricks.CoinAPI.MarketDataAPI.REST.V1.Model;
using CoinService.Configuration;
using CoinService.Data;
using CoinService.Helpers;
using Microsoft.Extensions.Options;

namespace CoinService.Services;

public class OrderBookCalculator
{
    private readonly ILogger<OrderBookCalculator> _logger;
    private readonly decimal[] _depthLevels;

    public OrderBookCalculator(
        ILogger<OrderBookCalculator> logger,
        IOptions<OrderBookOptions> options)
    {
        _logger = logger;
        _depthLevels = options.Value.DepthLevels;
    }

    public MarketMetric? Calculate(string symbolId, V1OrderBookBase orderBookData, DateTime timestamp)
    {
        try
        {
            if (orderBookData.BidsOption.Value is not JsonElement bidsElement ||
                orderBookData.AsksOption.Value is not JsonElement asksElement)
            {
                return null;
            }

            var bids = OrderBookParser.ParseOrders(bidsElement);
            var asks = OrderBookParser.ParseOrders(asksElement);

            if (bids.Count == 0 || asks.Count == 0)
            {
                return null;
            }

            var midPrice = (bids[0].Price + asks[0].Price) / 2;

            var metric = new MarketMetric
            {
                Time = timestamp,
                Symbol = symbolId,
                MidPrice = midPrice
            };

            foreach (var depth in _depthLevels)
            {
                var threshold = depth / 100m;
                var priceFloor = midPrice * (1 - threshold);
                var priceCeiling = midPrice * (1 + threshold);

                decimal bidVolume = 0;
                foreach (var (price, size) in bids)
                {
                    if (price >= priceFloor)
                        bidVolume += price * size;
                }

                decimal askVolume = 0;
                foreach (var (price, size) in asks)
                {
                    if (price <= priceCeiling)
                        askVolume += price * size;
                }

                metric.SetDepthVolumes(depth, bidVolume, askVolume);
            }

            return metric;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error calculating metrics for {Symbol}", symbolId);
            return null;
        }
    }
}