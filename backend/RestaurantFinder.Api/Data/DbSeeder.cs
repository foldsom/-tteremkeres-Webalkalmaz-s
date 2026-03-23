using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RestaurantFinder.Api.Entities;

namespace RestaurantFinder.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext db, ILogger logger)
    {
        var targetRestaurants = await LoadRestaurantsFromDatabaseFolderAsync(logger);

        if (targetRestaurants.Count == 0)
            return;

        var existingNames = await db.Restaurants
            .AsNoTracking()
            .Select(x => x.Name)
            .ToListAsync();

        var existingNameSet = existingNames.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var missing = targetRestaurants
            .Where(r => !existingNameSet.Contains(r.Name))
            .GroupBy(x => x.Name, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.First())
            .ToList();

        if (missing.Count == 0)
            return;

        await db.Restaurants.AddRangeAsync(missing);
        await db.SaveChangesAsync();

        logger.LogInformation("Seeded {Count} restaurants from JSON dataset.", missing.Count);
    }

    private static async Task<List<Restaurant>> LoadRestaurantsFromDatabaseFolderAsync(ILogger logger)
    {
        var path = ResolveSeedFilePath();
        if (path is null)
        {
            logger.LogWarning("Restaurant seed file not found. Looked for database/restaurants_seed.json in known locations.");
            return new List<Restaurant>();
        }

        try
        {
            await using var stream = File.OpenRead(path);

            var rows = await JsonSerializer.DeserializeAsync<List<RestaurantSeedRow>>(stream, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (rows is null || rows.Count == 0)
            {
                logger.LogWarning("Restaurant seed file exists at {Path} but contains no rows.", path);
                return new List<Restaurant>();
            }

            return rows.Select(x => new Restaurant
            {
                Name = x.Name,
                Address = x.Address,
                Cuisine = x.Cuisine,
                PriceCategory = x.PriceCategory,
                Latitude = x.Latitude,
                Longitude = x.Longitude
            }).ToList();
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Invalid JSON in restaurant seed file at {Path}.", path);
            throw;
        }
    }

    private static string? ResolveSeedFilePath()
    {
        var candidates = new[]
        {
            Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "database", "restaurants_seed.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "database", "restaurants_seed.json"),
            Path.Combine(AppContext.BaseDirectory, "database", "restaurants_seed.json")
        };

        return candidates.FirstOrDefault(File.Exists);
    }

    private sealed record RestaurantSeedRow(
        string Name,
        string Address,
        string Cuisine,
        int? PriceCategory,
        double? Latitude,
        double? Longitude
    );
}
