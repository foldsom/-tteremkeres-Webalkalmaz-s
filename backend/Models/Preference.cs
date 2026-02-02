using System.Collections.Generic;

public class Preference
{
    public int Id { get; set; }
    public string Name { get; set; }

    public ICollection<UserPreference> Users { get; set; }
}
