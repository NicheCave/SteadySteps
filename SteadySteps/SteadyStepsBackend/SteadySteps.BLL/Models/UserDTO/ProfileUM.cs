using System.ComponentModel.DataAnnotations;

namespace SteadySteps.BLL.Models.UserDTO;

public class ProfileUm
{
    [Required] [StringLength(64, MinimumLength = 2)] public string Username { get; set; } = null!;

    [Required] [EmailAddress] public string Email { get; set; } = null!;
}
