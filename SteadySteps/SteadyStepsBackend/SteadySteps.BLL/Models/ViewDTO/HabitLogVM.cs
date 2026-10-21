namespace SteadySteps.BLL.Models.ViewDTO;

public class HabitLogVm
{
    public Guid LogId { get; set; }

    public Guid HabitId { get; set; }

    public DateOnly LogDate { get; set; }

    public string? Status { get; set; }

    public string? Notes { get; set; }
}
