using System.ComponentModel.DataAnnotations;

namespace RestaurantFinder.Api.Entities;

public class Preference
{
    public int Id { get; set; }

    [Required, MaxLength(80)]
    public string Name { get; set; } = default!;
}
