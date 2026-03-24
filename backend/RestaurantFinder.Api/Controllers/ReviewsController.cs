using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
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
        try
        {
            var userId = ResolveUserId(User);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "Missing user id claim in token." });

            var existsUser = await _db.Users.AnyAsync(u => u.Id == userId);
            if (!existsUser)
                return Unauthorized(new { message = "User from token was not found. Please login again." });

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
        catch (DbUpdateException ex)
        {
            return BadRequest(new
            {
                message = "Could not save review. Please verify token, restaurant id and payload.",
                detail = ex.InnerException?.Message ?? ex.Message
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = "Review operation failed.",
                detail = ex.Message
            });
        }
    }

    [Authorize]
    [HttpDelete("{restaurantId:int}")]
    public async Task<IActionResult> DeleteMine(int restaurantId)
    {
        try
        {
            var userId = ResolveUserId(User);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "Missing user id claim in token." });

            var existsUser = await _db.Users.AnyAsync(u => u.Id == userId);
            if (!existsUser)
                return Unauthorized(new { message = "User from token was not found. Please login again." });

            var entity = await _db.RestaurantReviews
                .FirstOrDefaultAsync(x => x.UserId == userId && x.RestaurantId == restaurantId);

            if (entity is null)
                return NotFound(new { message = "No review to delete." });

            _db.RestaurantReviews.Remove(entity);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Deleted." });
        }
        catch (DbUpdateException ex)
        {
            return BadRequest(new
            {
                message = "Could not delete review.",
                detail = ex.InnerException?.Message ?? ex.Message
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = "Review delete failed.",
                detail = ex.Message
            });
        }
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

    public sealed class UpsertReviewRequest
    {
        [Range(1, 5)]
        public int Rating { get; set; }

        [StringLength(1000)]
        public string? Comment { get; set; }
    }

    private static string? ResolveUserId(ClaimsPrincipal principal)
    {
        return principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? principal.FindFirstValue(JwtRegisteredClaimNames.Sub);
    }
}