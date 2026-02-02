public class RestaurantImage
{
    public int Id { get; set; }
    public string ImageUrl { get; set; }

    public int RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; }
}
