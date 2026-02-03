using Microsoft.EntityFrameworkCore;

namespace Etteremkereso.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<Preference> Preferences => Set<Preference>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<RestaurantCategory> RestaurantCategories => Set<RestaurantCategory>();
    public DbSet<RestaurantImage> RestaurantImages => Set<RestaurantImage>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserPreference> UserPreferences => Set<UserPreference>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Favorite>()
            .HasKey(favorite => new { favorite.UserId, favorite.RestaurantId });

        modelBuilder.Entity<Favorite>()
            .HasOne(favorite => favorite.User)
            .WithMany(user => user.Favorites)
            .HasForeignKey(favorite => favorite.UserId);

        modelBuilder.Entity<Favorite>()
            .HasOne(favorite => favorite.Restaurant)
            .WithMany(restaurant => restaurant.Favorites)
            .HasForeignKey(favorite => favorite.RestaurantId);

        modelBuilder.Entity<RestaurantCategory>()
            .HasKey(rc => new { rc.RestaurantId, rc.CategoryId });

        modelBuilder.Entity<RestaurantCategory>()
            .HasOne(rc => rc.Restaurant)
            .WithMany(restaurant => restaurant.Categories)
            .HasForeignKey(rc => rc.RestaurantId);

        modelBuilder.Entity<RestaurantCategory>()
            .HasOne(rc => rc.Category)
            .WithMany(category => category.Restaurants)
            .HasForeignKey(rc => rc.CategoryId);

        modelBuilder.Entity<UserPreference>()
            .HasKey(up => new { up.UserId, up.PreferenceId });

        modelBuilder.Entity<UserPreference>()
            .HasOne(up => up.User)
            .WithMany(user => user.UserPreferences)
            .HasForeignKey(up => up.UserId);

        modelBuilder.Entity<UserPreference>()
            .HasOne(up => up.Preference)
            .WithMany(preference => preference.Users)
            .HasForeignKey(up => up.PreferenceId);

        modelBuilder.Entity<RestaurantImage>()
            .HasOne(image => image.Restaurant)
            .WithMany(restaurant => restaurant.Images)
            .HasForeignKey(image => image.RestaurantId);

        modelBuilder.Entity<Review>()
            .HasOne(review => review.Restaurant)
            .WithMany(restaurant => restaurant.Reviews)
            .HasForeignKey(review => review.RestaurantId);

        modelBuilder.Entity<Review>()
            .HasOne(review => review.User)
            .WithMany(user => user.Reviews)
            .HasForeignKey(review => review.UserId);
    }
}