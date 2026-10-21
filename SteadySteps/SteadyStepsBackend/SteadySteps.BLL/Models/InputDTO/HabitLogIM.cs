using System.ComponentModel.DataAnnotations;

namespace SteadySteps.BLL.Models.InputDTO;

public class HabitLogIm
{
    [Required] public Guid HabitId { get; set; }

    [Required] public DateOnly LogDate { get; set; }

    [MaxLength(50)] public string? Status { get; set; }

    [MaxLength(500)] public string? Notes { get; set; }
}
