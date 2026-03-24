using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
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
    public async Task<IActionResult> GetAll([FromQuery] RestaurantListQuery query)
    {
        var sortBy = (query.SortBy ?? "name").Trim().ToLowerInvariant();
        if (sortBy is not ("name" or "rating" or "reviews"))
            return BadRequest(new { message = "sortBy must be one of: name, rating, reviews." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (query.FavoritesOnly == true && string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "favoritesOnly requires authentication." });

        var restaurantsQuery = _db.Restaurants.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            restaurantsQuery = restaurantsQuery.Where(r =>
                EF.Functions.Like(r.Name, $"%{search}%") ||
                EF.Functions.Like(r.Address, $"%{search}%") ||
                EF.Functions.Like(r.Cuisine, $"%{search}%"));
        }

        if (!string.IsNullOrWhiteSpace(query.Cuisine))
        {
            var cuisine = query.Cuisine.Trim();
            restaurantsQuery = restaurantsQuery.Where(r => r.Cuisine == cuisine);
        }

        if (query.PriceCategory.HasValue)
            restaurantsQuery = restaurantsQuery.Where(r => r.PriceCategory == query.PriceCategory);

        var restaurants = await restaurantsQuery
            .Select(r => new
            {
                r.Id,
                r.Name,
                r.Address,
                r.Cuisine,
                r.PriceCategory,
                r.Latitude,
                r.Longitude
            })
            .ToListAsync();

        var restaurantIds = restaurants.Select(r => r.Id).ToList();

        var reviewStats = await _db.RestaurantReviews
            .AsNoTracking()
            .Where(x => restaurantIds.Contains(x.RestaurantId))
            .GroupBy(x => x.RestaurantId)
            .Select(g => new
            {
                RestaurantId = g.Key,
                ReviewCount = g.Count(),
                AverageRating = g.Average(x => x.Rating)
            })
            .ToDictionaryAsync(x => x.RestaurantId);

        HashSet<int> favoriteIds = new();
        if (!string.IsNullOrWhiteSpace(userId))
        {
            favoriteIds = (await _db.FavoriteRestaurants
                .AsNoTracking()
                .Where(x => x.UserId == userId && restaurantIds.Contains(x.RestaurantId))
                .Select(x => x.RestaurantId)
                .ToListAsync())
                .ToHashSet();
        }

        var projected = restaurants.Select(r =>
        {
            var hasStats = reviewStats.TryGetValue(r.Id, out var stats);
            var avg = hasStats ? stats!.AverageRating : 0;
            var count = hasStats ? stats!.ReviewCount : 0;
            var isFav = favoriteIds.Contains(r.Id);

            return new RestaurantListItem(
                r.Id,
                r.Name,
                r.Address,
                r.Cuisine,
                r.PriceCategory,
                r.Latitude,
                r.Longitude,
                count,
                avg,
                isFav
            );
        });

        if (query.MinRating.HasValue)
            projected = projected.Where(x => x.AverageRating >= query.MinRating.Value);

        if (query.FavoritesOnly == true)
            projected = projected.Where(x => x.IsFavorite);

        projected = sortBy switch
        {
            "rating" => projected.OrderByDescending(x => x.AverageRating).ThenBy(x => x.Name),
            "reviews" => projected.OrderByDescending(x => x.ReviewCount).ThenBy(x => x.Name),
            _ => projected.OrderBy(x => x.Name)
        };

        var totalCount = projected.Count();

        var page = Math.Max(1, query.Page ?? 1);
        var pageSize = Math.Clamp(query.PageSize ?? 20, 1, 100);

        var items = projected
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(new PagedRestaurantListResult(page, pageSize, totalCount, items));
    }

    [HttpGet("cuisines")]
    public async Task<IActionResult> GetCuisines()
    {
        var cuisines = await _db.Restaurants
            .AsNoTracking()
            .Select(x => x.Cuisine)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync();

        return Ok(cuisines);
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

        var result = await (
            from r in _db.Restaurants.AsNoTracking()
            join s in stats on r.Id equals s.RestaurantId into statsJoin
            from s in statsJoin.DefaultIfEmpty()
            where r.Latitude.HasValue && r.Longitude.HasValue
            orderby r.Name
            select new
            {
                r.Id,
                r.Name,
                latitude = r.Latitude!.Value,
                longitude = r.Longitude!.Value,
                r.Cuisine,
                r.Address,
                priceCategory = r.PriceCategory ?? 0,
                reviewCount = s == null ? 0 : s.ReviewCount,
                averageRating = s == null ? 0 : s.AverageRating
            }
        ).ToListAsync();

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

        var principal = User;
        var isFavorite = false;

        if (principal.Identity?.IsAuthenticated == true)
        {
            var currentUserId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrWhiteSpace(currentUserId))
            {
                isFavorite = await _db.FavoriteRestaurants
                    .AsNoTracking()
                    .AnyAsync(x => x.UserId == currentUserId && x.RestaurantId == id);
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

    public record RestaurantListQuery(
        [property: StringLength(120)] string? Search,
        [property: StringLength(60)] string? Cuisine,
        [property: Range(1, 3)] int? PriceCategory,
        [property: Range(1, 5)] double? MinRating,
        [property: StringLength(20)] string? SortBy,
        [property: Range(1, int.MaxValue)] int? Page,
        [property: Range(1, 100)] int? PageSize,
        bool? FavoritesOnly
    );

    public record RestaurantListItem(
        int Id,
        string Name,
        string Address,
        string Cuisine,
        int? PriceCategory,
        double? Latitude,
        double? Longitude,
        int ReviewCount,
        double AverageRating,
        bool IsFavorite
    );

    public record PagedRestaurantListResult(
        int Page,
        int PageSize,
        int TotalCount,
        IReadOnlyList<RestaurantListItem> Items
    );
}