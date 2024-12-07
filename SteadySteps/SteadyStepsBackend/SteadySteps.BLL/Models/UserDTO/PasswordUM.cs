using System.ComponentModel.DataAnnotations;

namespace SteadySteps.BLL.Models.UserDTO;

public class PasswordUm
{
    [MinLength(8)] public string  CurrentPassword { get; set; } = null!;
    [MinLength(8)] public string NewPassword { get; set; } = null!;
}