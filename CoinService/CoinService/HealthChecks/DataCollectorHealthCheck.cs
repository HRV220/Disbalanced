using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace CoinService.HealthChecks;

public class DataCollectorHealthCheck : IHealthCheck
{
    private static DateTime _lastSuccessfulCollection = DateTime.MinValue;
    private static int _lastCollectedCount = 0;
    private static readonly object _lock = new();

    public static void ReportSuccess(int count)
    {
        lock (_lock)
        {
            _lastSuccessfulCollection = DateTime.UtcNow;
            _lastCollectedCount = count;
        }
    }

    public static (DateTime LastCollection, int Count) GetStatus()
    {
        lock (_lock)
        {
            return (_lastSuccessfulCollection, _lastCollectedCount);
        }
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var (lastCollection, count) = GetStatus();

        if (lastCollection == DateTime.MinValue)
            return Task.FromResult(HealthCheckResult.Degraded("No data collected yet"));

        var lag = DateTime.UtcNow - lastCollection;

        if (lag > TimeSpan.FromMinutes(10))
            return Task.FromResult(HealthCheckResult.Unhealthy($"No data for {lag.TotalMinutes:F0} min"));

        return Task.FromResult(HealthCheckResult.Healthy($"Last: {count} symbols, {lag.TotalSeconds:F0}s ago"));
    }
}