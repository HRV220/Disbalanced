namespace CoinService.Configuration;

public class CoinApiKeyHandler : DelegatingHandler
{
    private readonly string _apiKey;

    public CoinApiKeyHandler(string apiKey)
    {
        _apiKey = apiKey;
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        request.Headers.Remove("X-CoinAPI-Key");
        request.Headers.Add("X-CoinAPI-Key", _apiKey);
        return await base.SendAsync(request, cancellationToken);
    }
}