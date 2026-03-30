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
    private readonly IWebHostEnvironment _env;

    public ImagesController(ApplicationDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpGet("restaurant/{restaurantId:int}")]
    public async Task<IActionResult> GetForRestaurant(int restaurantId)
    {
        var images = await _db.RestaurantImages.AsNoTracking().Where(x => x.RestaurantId == restaurantId).OrderByDescending(x => x.CreatedAtUtc).ToListAsync();
        return Ok(images);
    }

    [HttpPost("restaurant/{restaurantId:int}")]
    [Authorize]
    public async Task<IActionResult> UploadImage(int restaurantId, IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("Nincs fájl.");
        var uploads = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
        if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploads, fileName);
        using (var stream = new FileStream(filePath, FileMode.Create)) { await file.CopyToAsync(stream); }
        var entity = new RestaurantImage { RestaurantId = restaurantId, Url = $"/uploads/{fileName}", CreatedAtUtc = DateTime.UtcNow };
        _db.RestaurantImages.Add(entity);
        await _db.SaveChangesAsync();
        return Ok(entity);
    }
}