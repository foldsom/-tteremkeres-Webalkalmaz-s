using System;
using System.Collections.Generic;

public class Restaurant
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<RestaurantCategory> Categories { get; set; } = new List<RestaurantCategory>();
    public ICollection<RestaurantImage> Images { get; set; } = new List<RestaurantImage>();
}
