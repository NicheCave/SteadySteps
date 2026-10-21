namespace SteadySteps.BLL.Models.ViewDTO;

public class GoalVm
{
    public Guid GoalId { get; set; }

    public Guid? HabitId { get; set; }

    public int? Target { get; set; }

    public int? CurrentProgress { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public DateTime? CreatedAt { get; set; }
}
