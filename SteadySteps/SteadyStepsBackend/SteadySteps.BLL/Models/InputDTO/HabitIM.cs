using System.ComponentModel.DataAnnotations;

namespace SteadySteps.BLL.Models.InputDTO;

public class HabitIm
{
    [Required] [StringLength(100)] public string Name { get; set; } = null!;

    [StringLength(1500)] public string? Description { get; set; }

    [StringLength(50)] public string? Frequency { get; set; }
}
