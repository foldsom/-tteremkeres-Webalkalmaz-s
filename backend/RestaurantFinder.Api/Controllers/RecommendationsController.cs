using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using RestaurantFinder.Api.Data;

namespace RestaurantFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RecommendationsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public RecommendationsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var prefNames = await _db.UserPreferences
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .Include(x => x.Preference)
            .Select(x => x.Preference.Name)
            .ToListAsync();

        var cuisinePrefs = prefNames
            .Where(x => x.StartsWith("Cuisine:", StringComparison.OrdinalIgnoreCase))
            .Select(x => x.Substring("Cuisine:".Length))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var pricePrefs = prefNames
            .Where(x => x.StartsWith("Price:", StringComparison.OrdinalIgnoreCase))
            .Select(x => x.Substring("Price:".Length))
            .Select(x => int.TryParse(x, out var n) ? n : (int?)null)
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .ToHashSet();

        var q = _db.Restaurants.AsNoTracking().AsQueryable();

        if (cuisinePrefs.Count > 0)
            q = q.Where(r => cuisinePrefs.Contains(r.Cuisine));

        if (pricePrefs.Count > 0)
            q = q.Where(r => r.PriceCategory != null && pricePrefs.Contains(r.PriceCategory.Value));

        var restaurants = await q
            .OrderBy(r => r.Name)
            .Take(50)
            .ToListAsync();

        return Ok(new
        {
            cuisinePrefs = cuisinePrefs.ToArray(),
            pricePrefs = pricePrefs.ToArray(),
            restaurants
        });
    }
}
