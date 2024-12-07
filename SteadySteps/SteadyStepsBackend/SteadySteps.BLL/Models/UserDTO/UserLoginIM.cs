using System.ComponentModel.DataAnnotations;

namespace SteadySteps.BLL.Models.UserDTO;

public class UserLoginIm
{
    [Required] [EmailAddress] public string Email { get; set; } = null!;
    
    [Required] public string Password { get; set; } = null!;
}