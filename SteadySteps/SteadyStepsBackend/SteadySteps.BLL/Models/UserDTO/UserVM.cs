namespace SteadySteps.BLL.Models.UserDTO;

public class UserVm
{
    public Guid UserId { get; set; }
    
    public string Username { get; set; }  = null!;
    
    public string Email { get; set; }  = null!;
}