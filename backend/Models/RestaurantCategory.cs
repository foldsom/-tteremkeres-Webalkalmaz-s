public class RestaurantCategory
{
    public int RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; } = null!;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}
