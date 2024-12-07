using AutoMapper;
using SteadySteps.BLL.Models.UserDTO;
using SteadySteps.BLL.Services.Interfaces;
using SteadySteps.DAL.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SteadySteps.BLL.Services.Implementations;

public class UserService(UserManager<User> userManager, IMapper mapper) : IUserService
{
    public async Task<UserVm> CreateUserAsync(UserIm userIm, CancellationToken ct = default)
    {
        var user = mapper.Map<User>(userIm);
        var identityResult = await userManager.CreateAsync(user, userIm.Password);

        if (!identityResult.Succeeded)
            throw new IdentityException(identityResult.Errors);

        return mapper.Map<UserVm>(user);
    }

    public async Task<UserVm?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(e => e.Id == id, cancellationToken: ct);

        return user == null ? null : mapper.Map<UserVm>(user);
    }

    public async Task<bool> UpdateUserPassword(Guid id, PasswordUm passwordUm)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(e => e.Id == id);

        if (user == null)
            return false;

        var result = await userManager.ChangePasswordAsync(user, passwordUm.CurrentPassword, passwordUm.NewPassword);

        if (!result.Succeeded)
            throw new IdentityException(result.Errors);

        return true;
    }

    public async Task<bool> SoftDeleteUserAsync(Guid id)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(e => e.Id == id);

        if (user == null)
            return false;

        user.IsDeleted = true;
        var result = await userManager.UpdateAsync(user);

        if (!result.Succeeded)
            throw new IdentityException(result.Errors);

        return true;
    }
}