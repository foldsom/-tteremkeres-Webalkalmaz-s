using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RestaurantFinder.Api.Entities;

namespace RestaurantFinder.Api.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<FavoriteRestaurant> FavoriteRestaurants => Set<FavoriteRestaurant>();
    public DbSet<RestaurantReview> RestaurantReviews => Set<RestaurantReview>();
    public DbSet<RestaurantImage> RestaurantImages => Set<RestaurantImage>();
    public DbSet<Preference> Preferences => Set<Preference>();
    public DbSet<UserPreference> UserPreferences => Set<UserPreference>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<FavoriteRestaurant>()
            .HasKey(x => new { x.UserId, x.RestaurantId });

        modelBuilder.Entity<FavoriteRestaurant>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FavoriteRestaurant>()
            .HasOne(x => x.Restaurant)
            .WithMany()
            .HasForeignKey(x => x.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RestaurantReview>()
            .HasIndex(x => new { x.UserId, x.RestaurantId })
            .IsUnique();

        modelBuilder.Entity<RestaurantReview>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RestaurantReview>()
            .HasOne(x => x.Restaurant)
            .WithMany()
            .HasForeignKey(x => x.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserPreference>()
            .HasKey(x => new { x.UserId, x.PreferenceId });

        modelBuilder.Entity<UserPreference>()
            .HasOne(x => x.User)
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserPreference>()
            .HasOne(x => x.Preference)
            .WithMany()
            .HasForeignKey(x => x.PreferenceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RestaurantImage>()
            .HasOne(x => x.Restaurant)
            .WithMany()
            .HasForeignKey(x => x.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);

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

        modelBuilder.Entity<Preference>().HasData(
            new Preference { Id = 1, Name = "Cuisine:Hungarian" },
            new Preference { Id = 2, Name = "Cuisine:Italian" },
            new Preference { Id = 3, Name = "Cuisine:Mexican" },
            new Preference { Id = 4, Name = "Cuisine:Vegan" },
            new Preference { Id = 5, Name = "Cuisine:Vegetarian" },
            new Preference { Id = 6, Name = "Price:1" },
            new Preference { Id = 7, Name = "Price:2" },
            new Preference { Id = 8, Name = "Price:3" }
        );

        modelBuilder.Entity<RestaurantImage>().HasData(
            new RestaurantImage
            {
                Id = 1,
                RestaurantId = 1,
                Url = "https://picsum.photos/seed/paprika1/800/600",
                Caption = "Bejárat",
                CreatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new RestaurantImage
            {
                Id = 2,
                RestaurantId = 1,
                Url = "https://picsum.photos/seed/paprika2/800/600",
                Caption = "Belső tér",
                CreatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new RestaurantImage
            {
                Id = 3,
                RestaurantId = 2,
                Url = "https://picsum.photos/seed/roma1/800/600",
                Caption = "Tálalás",
                CreatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
