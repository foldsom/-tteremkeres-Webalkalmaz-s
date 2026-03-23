using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using RestaurantFinder.Api.Data;
using RestaurantFinder.Api.Entities;

namespace RestaurantFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ReviewsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [Authorize]
    [HttpPost("{restaurantId:int}")]
    public async Task<IActionResult> Upsert(int restaurantId, [FromBody] UpsertReviewRequest input)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var existsRestaurant = await _db.Restaurants.AnyAsync(r => r.Id == restaurantId);
        if (!existsRestaurant)
            return NotFound(new { message = $"Restaurant with id {restaurantId} not found." });

        var now = DateTime.UtcNow;

        var entity = await _db.RestaurantReviews
            .FirstOrDefaultAsync(x => x.UserId == userId && x.RestaurantId == restaurantId);

        if (entity is null)
        {
            entity = new RestaurantReview
            {
                UserId = userId,
                RestaurantId = restaurantId,
                Rating = input.Rating,
                Comment = input.Comment,
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            };

            _db.RestaurantReviews.Add(entity);
        }
        else
        {
            entity.Rating = input.Rating;
            entity.Comment = input.Comment;
            entity.UpdatedAtUtc = now;
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            entity.Id,
            entity.RestaurantId,
            entity.Rating,
            entity.Comment,
            entity.CreatedAtUtc,
            entity.UpdatedAtUtc
        });
    }

    [Authorize]
    [HttpDelete("{restaurantId:int}")]
    public async Task<IActionResult> DeleteMine(int restaurantId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var entity = await _db.RestaurantReviews
            .FirstOrDefaultAsync(x => x.UserId == userId && x.RestaurantId == restaurantId);

        if (entity is null)
            return NotFound(new { message = "No review to delete." });

        _db.RestaurantReviews.Remove(entity);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Deleted." });
    }

    [AllowAnonymous]
    [HttpGet("restaurant/{restaurantId:int}")]
    public async Task<IActionResult> GetForRestaurant(int restaurantId)
    {
        var existsRestaurant = await _db.Restaurants.AnyAsync(r => r.Id == restaurantId);
        if (!existsRestaurant)
            return NotFound(new { message = $"Restaurant with id {restaurantId} not found." });

        var reviews = await _db.RestaurantReviews
            .AsNoTracking()
            .Where(x => x.RestaurantId == restaurantId)
            .OrderByDescending(x => x.UpdatedAtUtc)
            .Select(x => new
            {
                x.Id,
                x.Rating,
                x.Comment,
                x.UpdatedAtUtc
            })
            .ToListAsync();

        var avg = reviews.Count == 0 ? 0 : reviews.Average(x => x.Rating);

        return Ok(new
        {
            restaurantId,
            averageRating = avg,
            reviewCount = reviews.Count,
            reviews
        });
    }

    public record UpsertReviewRequest(
        [property: Range(1, 5)] int Rating,
        [property: StringLength(1000)] string? Comment
    );
}
