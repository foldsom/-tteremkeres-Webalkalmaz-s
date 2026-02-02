public class Favorite
{
    public int UserId { get; set; }
    public User User { get; set; }

    public int RestaurantId { get; set; }
    public Restaurant Restaurant { get; set; }
}
