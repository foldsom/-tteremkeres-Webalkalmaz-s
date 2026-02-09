using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace RestaurantFinder.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MeController : ControllerBase
{
    [Authorize]
    [HttpGet]
    public IActionResult Get()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Ok(new { userId });
    }
}
