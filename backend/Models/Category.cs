using System.Collections.Generic;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<RestaurantCategory> Restaurants { get; set; } = new List<RestaurantCategory>();
}
