using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantFinder.Api.Data;
using RestaurantFinder.Api.Entities;

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
    public async Task<IActionResult> GetAll(
        [FromQuery] string? cuisine,
        [FromQuery] int? maxPriceCategory)
    {
        var query = _db.Restaurants.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(cuisine))
        {
            var c = cuisine.Trim();
            query = query.Where(r => r.Cuisine == c);
        }

        if (maxPriceCategory is not null)
        {
            query = query.Where(r => r.PriceCategory <= maxPriceCategory.Value);
        }

        var items = await query.OrderBy(r => r.Name).ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _db.Restaurants.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);

        if (item is null)
            return NotFound(new { message = $"Restaurant with id {id} not found." });

        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Restaurant input)
    {
        if (string.IsNullOrWhiteSpace(input.Name))
            return BadRequest(new { message = "Name is required." });

        if (string.IsNullOrWhiteSpace(input.Address))
            return BadRequest(new { message = "Address is required." });

        if (string.IsNullOrWhiteSpace(input.Cuisine))
            return BadRequest(new { message = "Cuisine is required." });

        if (input.PriceCategory < 1 || input.PriceCategory > 3)
            return BadRequest(new { message = "PriceCategory must be between 1 and 3." });

        input.Id = 0;

        _db.Restaurants.Add(input);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = input.Id }, input);
    }
}
