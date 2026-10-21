using System.Security.Claims;
using SteadySteps.BLL.Models.UserDTO;
using SteadySteps.BLL.Services.Interfaces;
using SteadySteps.DAL.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace SteadySteps.BLL.Services.Implementations;

public class AuthService(SignInManager<User> signInManager, UserManager<User> userManager) : IAuthService
{
    
    public async Task SignInAsync(UserLoginIm loginIm, CancellationToken ct = default)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(e => e.Email == loginIm.Email, ct);

        if (user == null)
            throw new IdentityException(new[]
            {
                new IdentityError
                {
                    Code = "InvalidCredentials",
                    Description = "Invalid email or password."
                }
            });

        var result = await signInManager.PasswordSignInAsync(user, loginIm.Password, true, lockoutOnFailure: true);

        if (!result.Succeeded)
            throw new IdentityException(new[]
            {
                new IdentityError
                {
                    Code = "InvalidCredentials",
                    Description = "Invalid email or password."
                }
            });

        user.LastLogin = DateTime.UtcNow;
        await userManager.UpdateAsync(user);
    }

    public async Task SignOutAsync(CancellationToken ct = default)
    {
        await signInManager.SignOutAsync();
    }

    /// <summary>
    /// Reissues the auth cookie from the user's current security stamp. Changing a
    /// password (or an e-mail address) rotates that stamp, which would otherwise
    /// invalidate the caller's own cookie and log them out mid-request.
    /// </summary>
    public async Task RefreshSignInAsync(User user, CancellationToken ct = default)
    {
        await signInManager.RefreshSignInAsync(user);
    }

    public Task<User?> AuthenticateUserAsync(ClaimsPrincipal userClaims, CancellationToken ct = default)
    {
        return userManager.GetUserAsync(userClaims);
    }
}