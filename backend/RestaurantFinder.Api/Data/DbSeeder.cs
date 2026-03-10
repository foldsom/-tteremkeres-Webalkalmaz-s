using Microsoft.EntityFrameworkCore;
using RestaurantFinder.Api.Entities;

namespace RestaurantFinder.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext db)
    {
        var targetRestaurants = new List<Restaurant>
        {
            new() { Name = "IKON Restaurant", Address = "Debrecen, Piac utca 23.", Cuisine = "Modern magyar", PriceCategory = 3, Latitude = 47.5317, Longitude = 21.6252 },
            new() { Name = "Bonita Bistro", Address = "Debrecen, Simonffy utca 5.", Cuisine = "Mediterrán", PriceCategory = 2, Latitude = 47.5298, Longitude = 21.6298 },
            new() { Name = "Wasabi Running Sushi", Address = "Debrecen, Csapó utca 30.", Cuisine = "Ázsiai", PriceCategory = 3, Latitude = 47.5328, Longitude = 21.6331 },
            new() { Name = "Vintage World", Address = "Debrecen, Piac utca 43.", Cuisine = "Nemzetközi", PriceCategory = 2, Latitude = 47.5325, Longitude = 21.6234 },
            new() { Name = "Reskontó", Address = "Debrecen, Péterfia utca 34.", Cuisine = "Magyar", PriceCategory = 2, Latitude = 47.5354, Longitude = 21.6228 },
            new() { Name = "Pálma Étterem", Address = "Debrecen, Füredi út 27.", Cuisine = "Magyaros", PriceCategory = 2, Latitude = 47.5442, Longitude = 21.6211 },
            new() { Name = "Leroy Cafe", Address = "Debrecen, Piac utca 11.", Cuisine = "Nemzetközi", PriceCategory = 2, Latitude = 47.5312, Longitude = 21.6270 },
            new() { Name = "Black Sheep Burger", Address = "Debrecen, Batthyány utca 18.", Cuisine = "Burger", PriceCategory = 1, Latitude = 47.5304, Longitude = 21.6257 },
            new() { Name = "DG Italiano", Address = "Debrecen, Kossuth utca 5.", Cuisine = "Olasz", PriceCategory = 2, Latitude = 47.5310, Longitude = 21.6290 },
            new() { Name = "Paletta Bisztró", Address = "Debrecen, Miklós utca 1.", Cuisine = "Bisztró", PriceCategory = 2, Latitude = 47.5297, Longitude = 21.6249 },
            new() { Name = "Govinda Vegetáriánus", Address = "Debrecen, Bajcsy-Zsilinszky utca 8.", Cuisine = "Vegán", PriceCategory = 1, Latitude = 47.5302, Longitude = 21.6265 },
            new() { Name = "Pizza Via", Address = "Debrecen, Csapó utca 26.", Cuisine = "Pizza", PriceCategory = 1, Latitude = 47.5321, Longitude = 21.6317 },
            new() { Name = "Kashmir Indiai Étterem", Address = "Debrecen, Csapó utca 24.", Cuisine = "Indiai", PriceCategory = 2, Latitude = 47.5320, Longitude = 21.6313 },
            new() { Name = "Maszek - az utcabár", Address = "Debrecen, Hal köz 3.", Cuisine = "Street food", PriceCategory = 1, Latitude = 47.5294, Longitude = 21.6269 },
            new() { Name = "Roncsbár Konyha", Address = "Debrecen, Blaháné utca 2.", Cuisine = "Street food", PriceCategory = 1, Latitude = 47.5318, Longitude = 21.6231 },
            new() { Name = "Csokonai Étterem", Address = "Debrecen, Kossuth utca 21.", Cuisine = "Magyar", PriceCategory = 3, Latitude = 47.5309, Longitude = 21.6268 },
            new() { Name = "Flaska Vendéglő", Address = "Debrecen, Miklós utca 3.", Cuisine = "Magyaros", PriceCategory = 2, Latitude = 47.5295, Longitude = 21.6253 },
            new() { Name = "Krúdy Étterem", Address = "Debrecen, Medgyessy sétány 4.", Cuisine = "Nemzetközi", PriceCategory = 2, Latitude = 47.5348, Longitude = 21.6312 },
            new() { Name = "Buri-Buri Sushi", Address = "Debrecen, Piac utca 18.", Cuisine = "Ázsiai", PriceCategory = 2, Latitude = 47.5314, Longitude = 21.6262 },
            new() { Name = "Belga Étterem", Address = "Debrecen, Piac utca 29.", Cuisine = "Nemzetközi", PriceCategory = 3, Latitude = 47.5318, Longitude = 21.6256 },
            new() { Name = "Alma Étterem", Address = "Debrecen, Vár utca 10.", Cuisine = "Magyar", PriceCategory = 2, Latitude = 47.5329, Longitude = 21.6204 },
            new() { Name = "Nemo Étterem", Address = "Debrecen, Piac utca 42.", Cuisine = "Nemzetközi", PriceCategory = 2, Latitude = 47.5323, Longitude = 21.6242 },
            new() { Name = "Egoist Kitchen", Address = "Debrecen, Simonffy utca 2.", Cuisine = "Bisztró", PriceCategory = 2, Latitude = 47.5301, Longitude = 21.6294 },
            new() { Name = "Pizza Monkey", Address = "Debrecen, Csapó utca 16.", Cuisine = "Pizza", PriceCategory = 1, Latitude = 47.5315, Longitude = 21.6303 },
            new() { Name = "PiriPonty Halétterem", Address = "Debrecen, Péterfia utca 49.", Cuisine = "Halételek", PriceCategory = 2, Latitude = 47.5372, Longitude = 21.6237 },
            new() { Name = "İstanbul Kebab", Address = "Debrecen, Kossuth utca 8.", Cuisine = "Török", PriceCategory = 1, Latitude = 47.5313, Longitude = 21.6286 },
            new() { Name = "Burger King Fórum", Address = "Debrecen, Csapó utca 30.", Cuisine = "Fast food", PriceCategory = 1, Latitude = 47.5327, Longitude = 21.6330 },
            new() { Name = "Sushi Story", Address = "Debrecen, Hal köz 2.", Cuisine = "Ázsiai", PriceCategory = 2, Latitude = 47.5296, Longitude = 21.6271 },
            new() { Name = "Centrál Étterem", Address = "Debrecen, Kossuth tér 1.", Cuisine = "Magyar", PriceCategory = 3, Latitude = 47.5319, Longitude = 21.6260 },
            new() { Name = "Manna Étterem", Address = "Debrecen, Füredi út 98.", Cuisine = "Nemzetközi", PriceCategory = 2, Latitude = 47.5486, Longitude = 21.6207 },
        };

        var existingNames = await db.Restaurants
            .AsNoTracking()
            .Select(x => x.Name)
            .ToListAsync();

        var missing = targetRestaurants
            .Where(r => !existingNames.Contains(r.Name))
            .ToList();

        if (missing.Count == 0)
            return;

        await db.Restaurants.AddRangeAsync(missing);
        await db.SaveChangesAsync();
    }
}
