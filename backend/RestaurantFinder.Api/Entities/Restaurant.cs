using System.ComponentModel.DataAnnotations;

namespace RestaurantFinder.Api.Entities;

public class Restaurant
{
    public int Id { get; set; }

    [Required, MaxLength(120)]
    public string Name { get; set; } = default!;

    [Required, MaxLength(200)]
    public string Address { get; set; } = default!;

    [Required, MaxLength(60)]
    public string Cuisine { get; set; } = default!;

    [Range(1, 3)]
    public int? PriceCategory { get; set; }

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
