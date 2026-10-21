namespace SteadySteps.BLL.Models.ViewDTO;

public class HabitVM
{
    public Guid HabitId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string? Frequency { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
