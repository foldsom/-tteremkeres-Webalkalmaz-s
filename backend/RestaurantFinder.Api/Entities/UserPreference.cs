namespace RestaurantFinder.Api.Entities;

public class UserPreference
{
    public string UserId { get; set; } = default!;
    public int PreferenceId { get; set; }

    public ApplicationUser User { get; set; } = default!;
    public Preference Preference { get; set; } = default!;
}
