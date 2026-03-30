using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using RestaurantFinder.Api.Data;
using RestaurantFinder.Api.Entities;

namespace RestaurantFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public FavoritesController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var favorites = await _db.FavoriteRestaurants
            .AsNoTracking()
            .Where(f => f.UserId == userId)
            .Select(f => f.Restaurant)
            .Select(r => new
            {
                r.Id,
                r.Name,
                r.Address,
                r.Cuisine,
                r.PriceCategory,
                AverageRating = _db.RestaurantReviews.Where(rev => rev.RestaurantId == r.Id).Any()
                    ? _db.RestaurantReviews.Where(rev => rev.RestaurantId == r.Id).Average(x => x.Rating)
                    : 0,
                ReviewCount = _db.RestaurantReviews.Count(rev => rev.RestaurantId == r.Id),
                ImageUrl = _db.RestaurantImages.Where(img => img.RestaurantId == r.Id).OrderBy(i => i.CreatedAtUtc).Select(i => i.Url).FirstOrDefault(),
                LatestReview = _db.RestaurantReviews.Where(rev => rev.RestaurantId == r.Id).OrderByDescending(x => x.Id).Select(x => x.Comment).FirstOrDefault()
            })
            .ToListAsync();

        return Ok(favorites);
    }

    [HttpPost("{restaurantId:int}")]
    public async Task<IActionResult> Add(int restaurantId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var existsRestaurant = await _db.Restaurants.AnyAsync(r => r.Id == restaurantId);
        if (!existsRestaurant) return NotFound(new { message = $"Restaurant with id {restaurantId} not found." });

        var already = await _db.FavoriteRestaurants.AnyAsync(x => x.UserId == userId && x.RestaurantId == restaurantId);
        if (already) return Ok(new { message = "Already in favorites." });

        _db.FavoriteRestaurants.Add(new FavoriteRestaurant
        {
            UserId = userId,
            RestaurantId = restaurantId
        });

        await _db.SaveChangesAsync();
        return Ok(new { message = "Added to favorites." });
    }

    [HttpDelete("{restaurantId:int}")]
    public async Task<IActionResult> Remove(int restaurantId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var entity = await _db.FavoriteRestaurants
            .FirstOrDefaultAsync(x => x.UserId == userId && x.RestaurantId == restaurantId);

        if (entity is null) return NotFound(new { message = "Not in favorites." });

        _db.FavoriteRestaurants.Remove(entity);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Removed from favorites." });
    }
}