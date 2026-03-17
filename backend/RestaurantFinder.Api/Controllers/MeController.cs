using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using RestaurantFinder.Api.Data;
using RestaurantFinder.Api.Entities;

namespace RestaurantFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MeController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public MeController(ApplicationDbContext db)
    {
        _db = db;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var user = await _db.Users
            .AsNoTracking()
            .Where(x => x.Id == userId)
            .Select(x => new
            {
                id = x.Id,
                email = x.Email,
                username = x.UserName
            })
            .FirstOrDefaultAsync();

        if (user is null)
            return NotFound();

        return Ok(user);
    }

    [Authorize]
    [HttpGet("preferences")]
    public async Task<IActionResult> GetPreferences()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var prefs = await _db.UserPreferences
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .Include(x => x.Preference)
            .OrderBy(x => x.PreferenceId)
            .Select(x => new { x.PreferenceId, x.Preference.Name })
            .ToListAsync();

        return Ok(prefs);
    }

    [Authorize]
    [HttpPut("preferences")]
    public async Task<IActionResult> SetPreferences([FromBody] SetPreferencesRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var ids = request.PreferenceIds?.Distinct().ToArray() ?? Array.Empty<int>();

        var validIds = await _db.Preferences
            .AsNoTracking()
            .Where(p => ids.Contains(p.Id))
            .Select(p => p.Id)
            .ToListAsync();

        var existing = await _db.UserPreferences
            .Where(x => x.UserId == userId)
            .ToListAsync();

        _db.UserPreferences.RemoveRange(existing);

        foreach (var pid in validIds)
        {
            _db.UserPreferences.Add(new UserPreference
            {
                UserId = userId,
                PreferenceId = pid
            });
        }

        await _db.SaveChangesAsync();

        return Ok(new { preferenceIds = validIds });
    }

    public record SetPreferencesRequest(int[]? PreferenceIds);
}
