namespace CoinService.Api.Dto;

public class DepthIndicatorResponse
{
    public string Symbol { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public List<DepthPoint> Points { get; set; } = new();
}

public class DepthPoint
{
    public long Time { get; set; }  // Unix timestamp milliseconds

    public decimal Bid_1_5 { get; set; }
    public decimal Bid_3 { get; set; }
    public decimal Bid_5 { get; set; }
    public decimal Bid_8 { get; set; }
    public decimal Bid_15 { get; set; }
    public decimal Bid_30 { get; set; }

    public decimal Ask_1_5 { get; set; }
    public decimal Ask_3 { get; set; }
    public decimal Ask_5 { get; set; }
    public decimal Ask_8 { get; set; }
    public decimal Ask_15 { get; set; }
    public decimal Ask_30 { get; set; }
}