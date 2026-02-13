using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using RestaurantFinder.Api.Data;

namespace RestaurantFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RestaurantsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public RestaurantsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var restaurants = await _db.Restaurants
            .AsNoTracking()
            .OrderBy(r => r.Name)
            .ToListAsync();

        return Ok(restaurants);
    }

    [HttpGet("map")]
    public async Task<IActionResult> GetMap()
    {
        var stats = _db.RestaurantReviews
            .AsNoTracking()
            .GroupBy(x => x.RestaurantId)
            .Select(g => new
            {
                RestaurantId = g.Key,
                ReviewCount = g.Count(),
                AverageRating = g.Average(x => x.Rating)
            });

        var baseRows = await _db.Restaurants
            .AsNoTracking()
            .Select(r => new
            {
                r.Id,
                r.Name,
                r.Cuisine,
                priceCategory = (int?)r.PriceCategory,
                latitude = (double?)r.Latitude,
                longitude = (double?)r.Longitude
            })
            .ToListAsync();

        var ids = baseRows.Select(x => x.Id).ToList();

        var statsRows = await stats
            .Where(x => ids.Contains(x.RestaurantId))
            .ToListAsync();

        var statsDict = statsRows.ToDictionary(x => x.RestaurantId, x => x);

        var result = baseRows
            .Where(x => x.latitude.HasValue && x.longitude.HasValue)
            .OrderBy(x => x.Name)
            .Select(x =>
            {
                statsDict.TryGetValue(x.Id, out var s);
                return new
                {
                    x.Id,
                    x.Name,
                    latitude = x.latitude!.Value,
                    longitude = x.longitude!.Value,
                    x.Cuisine,
                    priceCategory = x.priceCategory ?? 0,
                    reviewCount = s == null ? 0 : s.ReviewCount,
                    averageRating = s == null ? 0 : s.AverageRating
                };
            })
            .ToList();

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var restaurant = await _db.Restaurants
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (restaurant is null)
            return NotFound(new { message = $"Restaurant with id {id} not found." });

        var stats = await _db.RestaurantReviews
            .AsNoTracking()
            .Where(x => x.RestaurantId == id)
            .GroupBy(x => x.RestaurantId)
            .Select(g => new
            {
                reviewCount = g.Count(),
                averageRating = g.Average(x => x.Rating)
            })
            .FirstOrDefaultAsync();

        var isAuthenticated = User?.Identity?.IsAuthenticated == true;
        var isFavorite = false;

        if (isAuthenticated)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrWhiteSpace(userId))
            {
                isFavorite = await _db.FavoriteRestaurants
                    .AsNoTracking()
                    .AnyAsync(x => x.UserId == userId && x.RestaurantId == id);
            }
        }

        return Ok(new
        {
            restaurant,
            reviewCount = stats?.reviewCount ?? 0,
            averageRating = stats?.averageRating ?? 0,
            isFavorite
        });
    }
}
