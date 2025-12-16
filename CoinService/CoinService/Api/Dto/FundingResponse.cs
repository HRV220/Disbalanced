namespace CoinService.Api.Dto;

public class FundingResponse
{
    public List<FundingPoint> Points { get; set; } = new();
}

public class FundingPoint
{
    public long Time { get; set; }  // Unix timestamp milliseconds
    public decimal FundingRate { get; set; }
}