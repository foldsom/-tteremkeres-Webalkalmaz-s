using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantFinder.Api.Data;
using RestaurantFinder.Api.Entities;

namespace RestaurantFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public ImagesController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("restaurant/{restaurantId:int}")]
    public async Task<IActionResult> GetForRestaurant(int restaurantId)
    {
        var exists = await _db.Restaurants.AsNoTracking().AnyAsync(r => r.Id == restaurantId);
        if (!exists)
            return NotFound(new { message = $"Restaurant with id {restaurantId} not found." });

        var images = await _db.RestaurantImages
            .AsNoTracking()
            .Where(x => x.RestaurantId == restaurantId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync();

        return Ok(images);
    }

    [HttpPost("restaurant/{restaurantId:int}")]
    [Authorize]
    public async Task<IActionResult> AddToRestaurant(int restaurantId, [FromBody] CreateImageRequest request)
    {
        var exists = await _db.Restaurants.AnyAsync(r => r.Id == restaurantId);
        if (!exists)
            return NotFound(new { message = $"Restaurant with id {restaurantId} not found." });

        if (string.IsNullOrWhiteSpace(request.Url))
            return BadRequest(new { message = "Url is required." });

        var entity = new RestaurantImage
        {
            RestaurantId = restaurantId,
            Url = request.Url.Trim(),
            Caption = string.IsNullOrWhiteSpace(request.Caption) ? null : request.Caption.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.RestaurantImages.Add(entity);
        await _db.SaveChangesAsync();

        return Ok(entity);
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.RestaurantImages.FirstOrDefaultAsync(x => x.Id == id);
        if (entity is null)
            return NotFound(new { message = $"Image with id {id} not found." });

        _db.RestaurantImages.Remove(entity);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Deleted." });
    }

    public record CreateImageRequest(string Url, string? Caption);
}
