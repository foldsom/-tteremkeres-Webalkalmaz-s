using Etteremkereso.Data;
using Etteremkereso.Dtos;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
}

app.UseHttpsRedirection();

var api = app.MapGroup("/api");

api.MapGet("/restaurants", async (AppDbContext db) =>
        await db.Restaurants.AsNoTracking().ToListAsync())
    .WithName("GetRestaurants");

api.MapGet("/restaurants/{id:int}", async (int id, AppDbContext db) =>
    await db.Restaurants.AsNoTracking().FirstOrDefaultAsync(restaurant => restaurant.Id == id)
        is { } restaurant
        ? Results.Ok(restaurant)
        : Results.NotFound())
    .WithName("GetRestaurantById");

api.MapPost("/restaurants", async (RestaurantCreateDto dto, AppDbContext db) =>
{
    var restaurant = new Restaurant
    {
        Name = dto.Name,
        Description = dto.Description,
        Address = dto.Address,
        Latitude = dto.Latitude,
        Longitude = dto.Longitude
    };

    db.Restaurants.Add(restaurant);
    await db.SaveChangesAsync();

    return Results.Created($"/api/restaurants/{restaurant.Id}", restaurant);
}).WithName("CreateRestaurant");

api.MapPut("/restaurants/{id:int}", async (int id, RestaurantUpdateDto dto, AppDbContext db) =>
{
    var restaurant = await db.Restaurants.FindAsync(id);
    if (restaurant is null)
    {
        return Results.NotFound();
    }

    restaurant.Name = dto.Name;
    restaurant.Description = dto.Description;
    restaurant.Address = dto.Address;
    restaurant.Latitude = dto.Latitude;
    restaurant.Longitude = dto.Longitude;

    await db.SaveChangesAsync();

    return Results.Ok(restaurant);
}).WithName("UpdateRestaurant");

api.MapDelete("/restaurants/{id:int}", async (int id, AppDbContext db) =>
{
    var restaurant = await db.Restaurants.FindAsync(id);
    if (restaurant is null)
    {
        return Results.NotFound();
    }

    db.Restaurants.Remove(restaurant);
    await db.SaveChangesAsync();

    return Results.NoContent();
}).WithName("DeleteRestaurant");

api.MapGet("/categories", async (AppDbContext db) =>
        await db.Categories.AsNoTracking().ToListAsync())
    .WithName("GetCategories");

api.MapGet("/categories/{id:int}", async (int id, AppDbContext db) =>
    await db.Categories.AsNoTracking().FirstOrDefaultAsync(category => category.Id == id)
        is { } category
        ? Results.Ok(category)
        : Results.NotFound())
    .WithName("GetCategoryById");

api.MapPost("/categories", async (CategoryCreateDto dto, AppDbContext db) =>
{
    var category = new Category
    {
        Name = dto.Name
    };

    db.Categories.Add(category);
    await db.SaveChangesAsync();

    return Results.Created($"/api/categories/{category.Id}", category);
}).WithName("CreateCategory");

api.MapPut("/categories/{id:int}", async (int id, CategoryUpdateDto dto, AppDbContext db) =>
{
    var category = await db.Categories.FindAsync(id);
    if (category is null)
    {
        return Results.NotFound();
    }

    category.Name = dto.Name;
    await db.SaveChangesAsync();

    return Results.Ok(category);
}).WithName("UpdateCategory");

api.MapDelete("/categories/{id:int}", async (int id, AppDbContext db) =>
{
    var category = await db.Categories.FindAsync(id);
    if (category is null)
    {
        return Results.NotFound();
    }

    db.Categories.Remove(category);
    await db.SaveChangesAsync();

    return Results.NoContent();
}).WithName("DeleteCategory");

api.MapGet("/users", async (AppDbContext db) =>
        await db.Users.AsNoTracking().ToListAsync())
    .WithName("GetUsers");

api.MapGet("/users/{id:int}", async (int id, AppDbContext db) =>
    await db.Users.AsNoTracking().FirstOrDefaultAsync(user => user.Id == id)
        is { } user
        ? Results.Ok(user)
        : Results.NotFound())
    .WithName("GetUserById");

api.MapPost("/users", async (UserCreateDto dto, AppDbContext db) =>
{
    var user = new User
    {
        Username = dto.Username,
        Email = dto.Email,
        PasswordHash = dto.PasswordHash
    };

    db.Users.Add(user);
    await db.SaveChangesAsync();

    return Results.Created($"/api/users/{user.Id}", user);
}).WithName("CreateUser");

api.MapPut("/users/{id:int}", async (int id, UserUpdateDto dto, AppDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user is null)
    {
        return Results.NotFound();
    }

    user.Username = dto.Username;
    user.Email = dto.Email;
    user.PasswordHash = dto.PasswordHash;
    await db.SaveChangesAsync();

    return Results.Ok(user);
}).WithName("UpdateUser");

api.MapDelete("/users/{id:int}", async (int id, AppDbContext db) =>
{
    var user = await db.Users.FindAsync(id);
    if (user is null)
    {
        return Results.NotFound();
    }

    db.Users.Remove(user);
    await db.SaveChangesAsync();

    return Results.NoContent();
}).WithName("DeleteUser");

api.MapGet("/reviews", async (AppDbContext db) =>
        await db.Reviews.AsNoTracking().ToListAsync())
    .WithName("GetReviews");

api.MapGet("/reviews/{id:int}", async (int id, AppDbContext db) =>
    await db.Reviews.AsNoTracking().FirstOrDefaultAsync(review => review.Id == id)
        is { } review
        ? Results.Ok(review)
        : Results.NotFound())
    .WithName("GetReviewById");

api.MapPost("/reviews", async (ReviewCreateDto dto, AppDbContext db) =>
{
    var userExists = await db.Users.AnyAsync(user => user.Id == dto.UserId);
    var restaurantExists = await db.Restaurants.AnyAsync(restaurant => restaurant.Id == dto.RestaurantId);
    if (!userExists || !restaurantExists)
    {
        return Results.BadRequest("User or restaurant not found.");
    }

    var review = new Review
    {
        Rating = dto.Rating,
        Comment = dto.Comment,
        UserId = dto.UserId,
        RestaurantId = dto.RestaurantId
    };

    db.Reviews.Add(review);
    await db.SaveChangesAsync();

    return Results.Created($"/api/reviews/{review.Id}", review);
}).WithName("CreateReview");

api.MapPut("/reviews/{id:int}", async (int id, ReviewUpdateDto dto, AppDbContext db) =>
{
    var review = await db.Reviews.FindAsync(id);
    if (review is null)
    {
        return Results.NotFound();
    }

    review.Rating = dto.Rating;
    review.Comment = dto.Comment;
    await db.SaveChangesAsync();

    return Results.Ok(review);
}).WithName("UpdateReview");

api.MapDelete("/reviews/{id:int}", async (int id, AppDbContext db) =>
{
    var review = await db.Reviews.FindAsync(id);
    if (review is null)
    {
        return Results.NotFound();
    }

    db.Reviews.Remove(review);
    await db.SaveChangesAsync();

    return Results.NoContent();
}).WithName("DeleteReview");

app.Run();
