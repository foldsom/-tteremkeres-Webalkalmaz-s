using System;
using System.Collections.Generic;

public class Restaurant
{
    public int Id { get; set; }

    public string Name { get; set; }
    public string Description { get; set; }
    public string Address { get; set; }

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Review> Reviews { get; set; }
    public ICollection<Favorite> Favorites { get; set; }
    public ICollection<RestaurantCategory> Categories { get; set; }
    public ICollection<RestaurantImage> Images { get; set; }
}
