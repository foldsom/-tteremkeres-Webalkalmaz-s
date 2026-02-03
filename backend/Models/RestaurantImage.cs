public class RestaurantImage
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;

    public int RestaurantId { get; set; } //
    public Restaurant Restaurant { get; set; } = null!;
}
