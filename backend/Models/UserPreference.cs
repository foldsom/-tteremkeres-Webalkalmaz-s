public class UserPreference
{
    public int UserId { get; set; }
    public User User { get; set; }

    public int PreferenceId { get; set; }
    public Preference Preference { get; set; }
}
