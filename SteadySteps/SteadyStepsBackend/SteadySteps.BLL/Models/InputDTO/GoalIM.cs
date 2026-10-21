using System.ComponentModel.DataAnnotations;

namespace SteadySteps.BLL.Models.InputDTO;

public class GoalIm
{
    [Required] public Guid HabitId { get; set; }

    [Required] public int? Target { get; set; }

    public int? CurrentProgress { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }
}
