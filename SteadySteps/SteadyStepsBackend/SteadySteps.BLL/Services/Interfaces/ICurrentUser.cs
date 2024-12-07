using SteadySteps.DAL.Models;

namespace SteadySteps.BLL.Services.Interfaces
{
    public interface ICurrentUser
    {
        public User User { get; set; }
    }
}