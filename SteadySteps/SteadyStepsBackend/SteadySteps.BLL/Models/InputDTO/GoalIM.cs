using System.ComponentModel.DataAnnotations;

namespace SteadySteps.BLL.Models.InputDTO;

public class GoalIm
{
    [Required] public Guid? UserId { get; set; }

    public Guid? HabitId { get; set; }

    [Required] public int? Target { get; set; }

    [Required] public int? CurrentProgress { get; set; }

    public bool IsDeleted { get; set; } = false;

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public DateTime? CreatedAt { get; set; }
}