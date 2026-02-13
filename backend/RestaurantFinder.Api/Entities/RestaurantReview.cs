using System.ComponentModel.DataAnnotations;

namespace RestaurantFinder.Api.Entities;

public class RestaurantReview
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = default!;

    public int RestaurantId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }

    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }

    public ApplicationUser User { get; set; } = default!;
    public Restaurant Restaurant { get; set; } = default!;
}
