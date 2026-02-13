using System.ComponentModel.DataAnnotations;

namespace RestaurantFinder.Api.Entities;

public class RestaurantImage
{
    public int Id { get; set; }
    public int RestaurantId { get; set; }

    [Required, MaxLength(500)]
    public string Url { get; set; } = default!;

    [MaxLength(200)]
    public string? Caption { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public Restaurant Restaurant { get; set; } = default!;
}