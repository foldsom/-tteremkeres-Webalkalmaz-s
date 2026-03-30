using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;
using System.Text;
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
            .Select(MapCuisinePreferenceToCanonical)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var pricePrefs = prefNames
            .Where(x => x.StartsWith("Price:", StringComparison.OrdinalIgnoreCase))
            .Select(x => x.Substring("Price:".Length))
            .Select(x => int.TryParse(x, out var n) ? n : (int?)null)
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .ToHashSet();

        var stylePrefs = prefNames
            .Where(x => x.StartsWith("Style:", StringComparison.OrdinalIgnoreCase))
            .Select(x => x.Substring("Style:".Length))
            .Select(MapStylePreferenceToCanonical)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        if (cuisinePrefs.Count == 0 && pricePrefs.Count == 0 && stylePrefs.Count == 0)
        {
            return Ok(new
            {
                cuisinePrefs = Array.Empty<string>(),
                pricePrefs = Array.Empty<int>(),
                stylePrefs = Array.Empty<string>(),
                restaurants = Array.Empty<object>()
            });
        }

        var restaurants = await _db.Restaurants
            .AsNoTracking()
            .OrderBy(r => r.Name)
            .ToListAsync();

        restaurants = restaurants
            .Where(r =>
            {
                var matchesCuisine = cuisinePrefs.Count > 0 &&
                                     cuisinePrefs.Contains(MapRestaurantCuisineToCanonical(r.Cuisine));

                var matchesPrice = pricePrefs.Count > 0 &&
                                   r.PriceCategory.HasValue &&
                                   pricePrefs.Contains(r.PriceCategory.Value);

                var matchesStyle = stylePrefs.Count > 0 &&
                                   stylePrefs.Contains(MapRestaurantStyleToCanonical(r.Cuisine));

                // AND logika csoportok között
                var cuisineOk = cuisinePrefs.Count == 0 || matchesCuisine;
                var priceOk = pricePrefs.Count == 0 || matchesPrice;
                var styleOk = stylePrefs.Count == 0 || matchesStyle;

                return cuisineOk && priceOk && styleOk;
            })
            .ToList();

        restaurants = restaurants
            .OrderBy(r => r.Name)
            .Take(50)
            .ToList();

        return Ok(new
        {
            cuisinePrefs = cuisinePrefs.ToArray(),
            pricePrefs = pricePrefs.ToArray(),
            stylePrefs = stylePrefs.ToArray(),
            restaurants
        });
    }

    private static string MapCuisinePreferenceToCanonical(string cuisinePreference)
    {
        var normalized = NormalizeToken(cuisinePreference);

        if (normalized.Contains("magyar") || normalized.Contains("hungar"))
            return "hungarian";
        if (normalized.Contains("olasz") || normalized.Contains("ital"))
            return "italian";
        if (normalized.Contains("mex"))
            return "mexican";
        if (normalized.Contains("vega") || normalized.Contains("vegetar"))
            return "plant-based";
        if (normalized.Contains("azsiai") || normalized.Contains("asian"))
            return "asian";
        if (normalized.Contains("indiai") || normalized.Contains("indian"))
            return "indian";
        if (normalized.Contains("mediterran") || normalized.Contains("mediterranean"))
            return "mediterranean";
        if (normalized.Contains("torok") || normalized.Contains("turkish"))
            return "turkish";

        return normalized;
    }

    private static string MapRestaurantCuisineToCanonical(string cuisine)
    {
        var normalized = NormalizeToken(cuisine);

        if (normalized.Contains("magyar") || normalized.Contains("hungar"))
            return "hungarian";
        if (normalized.Contains("olasz") || normalized.Contains("pizza") || normalized.Contains("ital"))
            return "italian";
        if (normalized.Contains("mex"))
            return "mexican";
        if (normalized.Contains("vega") || normalized.Contains("vegetar"))
            return "plant-based";
        if (normalized.Contains("azsiai") || normalized.Contains("asian"))
            return "asian";
        if (normalized.Contains("indiai") || normalized.Contains("indian"))
            return "indian";
        if (normalized.Contains("mediterran") || normalized.Contains("mediterranean"))
            return "mediterranean";
        if (normalized.Contains("torok") || normalized.Contains("turkish"))
            return "turkish";

        return normalized;
    }

    private static string MapStylePreferenceToCanonical(string stylePreference)
    {
        var normalized = NormalizeToken(stylePreference);
        if (normalized.Contains("bistro")) return "bistro";
        if (normalized.Contains("street")) return "street-food";
        if (normalized.Contains("seafood") || normalized.Contains("hal")) return "seafood";
        if (normalized.Contains("burger")) return "burger";
        if (normalized.Contains("fast")) return "fast-food";
        return normalized;
    }

    private static string MapRestaurantStyleToCanonical(string cuisine)
    {
        var normalized = NormalizeToken(cuisine);
        if (normalized.Contains("bistro") || normalized.Contains("bisztro")) return "bistro";
        if (normalized.Contains("street")) return "street-food";
        if (normalized.Contains("hal")) return "seafood";
        if (normalized.Contains("burger")) return "burger";
        if (normalized.Contains("fast")) return "fast-food";
        return normalized;
    }

    private static string NormalizeToken(string value)
    {
        var decomposed = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(decomposed.Length);

        foreach (var c in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }

        return sb.ToString().Normalize(NormalizationForm.FormC);
    }
}