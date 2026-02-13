namespace RestaurantFinder.Api.Entities;

public class FavoriteRestaurant
{
    public string UserId { get; set; } = default!;
    public int RestaurantId { get; set; }

    public ApplicationUser User { get; set; } = default!;
    public Restaurant Restaurant { get; set; } = default!;
}
