using CoinService.Api.Dto;
using CoinService.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoinService.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SymbolsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ILogger<SymbolsController> _logger;

    public SymbolsController(AppDbContext db, ILogger<SymbolsController> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Получить список всех доступных торговых пар
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<SymbolsResponse>> GetSymbols()
    {
        try
        {
            // Получаем уникальные символы из последних данных
            var symbols = await _db.Metrics
                .GroupBy(m => new { m.Symbol, m.BaseAsset, m.QuoteAsset, m.ExchangeId })
                .Select(g => new SymbolDto
                {
                    Symbol = g.Key.BaseAsset + g.Key.QuoteAsset,  // BTCUSDT формат
                    BaseAsset = g.Key.BaseAsset,
                    QuoteAsset = g.Key.QuoteAsset,
                    Description = g.Key.BaseAsset + " / " + g.Key.QuoteAsset,
                    Exchange = g.Key.ExchangeId
                })
                .ToListAsync();

            return Ok(new SymbolsResponse { Symbols = symbols });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting symbols");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}