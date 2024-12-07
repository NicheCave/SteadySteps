using SteadySteps.BLL.Services.Interfaces;
using SteadySteps.DAL.Models;

namespace SteadySteps.BLL.Services.Implementations;

public class CurrentUser : ICurrentUser
{
    public User User { get; set; } = null!;
}