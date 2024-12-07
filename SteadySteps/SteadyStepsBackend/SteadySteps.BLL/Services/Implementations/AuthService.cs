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

        var result = await signInManager.PasswordSignInAsync(user, loginIm.Password, true, false);

        if (!result.Succeeded)
            throw new IdentityException(new[]
            {
                new IdentityError
                {
                    Code = "InvalidCredentials",
                    Description = "Invalid email or password."
                }
            });
    }

    public async Task SignOutAsync(CancellationToken ct = default)
    {
        await signInManager.SignOutAsync();
    }

    public Task<User?> AuthenticateUserAsync(ClaimsPrincipal userClaims, CancellationToken ct = default)
    {
        return userManager.GetUserAsync(userClaims);
    }
}