using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RestaurantFinder.Api.Entities;

namespace RestaurantFinder.Api.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Restaurant> Restaurants => Set<Restaurant>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Restaurant>().HasData(
            new Restaurant
            {
                Id = 1,
                Name = "Paprika Bistro",
                Address = "Budapest, Fő utca 1.",
                Cuisine = "Hungarian",
                PriceCategory = 2,
                Latitude = 47.4979,
                Longitude = 19.0402
            },
            new Restaurant
            {
                Id = 2,
                Name = "Trattoria Roma",
                Address = "Budapest, Andrássy út 10.",
                Cuisine = "Italian",
                PriceCategory = 2,
                Latitude = 47.5060,
                Longitude = 19.0660
            }
        );
    }
}
