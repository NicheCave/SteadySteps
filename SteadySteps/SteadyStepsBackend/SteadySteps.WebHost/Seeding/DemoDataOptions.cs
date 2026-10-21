namespace SteadySteps.WebHost.Seeding;

/// <summary>Configuration for <see cref="DemoDataSeeder"/>, bound from the "DemoData" section.</summary>
public class DemoDataOptions
{
    public const string SectionName = "DemoData";

    /// <summary>Seeding is opt-in and only ever honoured in the Development environment.</summary>
    public bool Enabled { get; set; }

    public string Username { get; set; } = "strangerdanger";

    public string Email { get; set; } = "strangerdanger@steadysteps.local";

    /// <summary>Only used when the demo account doesn't exist yet; an existing account keeps its own password.</summary>
    public string Password { get; set; } = "StraNger-D4nger!";

    /// <summary>How far back the generated habit log history reaches.</summary>
    public int HistoryDays { get; set; } = 120;
}
