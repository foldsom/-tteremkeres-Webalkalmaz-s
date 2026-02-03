using System.Collections.Generic;

public class Preference
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<UserPreference> Users { get; set; } = new List<UserPreference>();
}
