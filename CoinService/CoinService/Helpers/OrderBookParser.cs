using System.Text.Json;

namespace CoinService.Helpers;

public static class OrderBookParser
{
    public static List<(decimal Price, decimal Size)> ParseOrders(JsonElement root)
    {
        if (root.ValueKind != JsonValueKind.Array)
            return new List<(decimal, decimal)>(0);

        int count = root.GetArrayLength();
        var list = new List<(decimal, decimal)>(count);

        foreach (var item in root.EnumerateArray())
        {
            if (item.TryGetProperty("price", out var pProp) &&
                item.TryGetProperty("size", out var sProp) &&
                pProp.TryGetDecimal(out var price) &&
                sProp.TryGetDecimal(out var size))
            {
                list.Add((price, size));
            }
        }

        return list;
    }
}