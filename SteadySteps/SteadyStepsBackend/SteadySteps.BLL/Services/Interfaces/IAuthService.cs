using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using SteadySteps.DAL.Models;
using SteadySteps.BLL.Models.UserDTO;

namespace SteadySteps.BLL.Services.Interfaces
{
    public interface IAuthService
    {
        Task SignInAsync(UserLoginIm loginIm, CancellationToken ct = default);
        Task SignOutAsync(CancellationToken ct = default);
        Task<User?> AuthenticateUserAsync(ClaimsPrincipal claimsPrincipal, CancellationToken ct = default);
    }
}