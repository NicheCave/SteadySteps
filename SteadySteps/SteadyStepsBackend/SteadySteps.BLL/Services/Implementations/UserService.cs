using AutoMapper;
using SteadySteps.BLL.Models.UserDTO;
using SteadySteps.BLL.Models.ViewDTO;
using SteadySteps.BLL.Services.Interfaces;
using SteadySteps.DAL.Data;
using SteadySteps.DAL.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SteadySteps.BLL.Services.Implementations;

public class UserService(SteadyStepsDbContext context, UserManager<User> userManager, IMapper mapper) : IUserService
{
    public async Task<UserVm> CreateUserAsync(UserIm userIm, CancellationToken ct = default)
    {
        var user = mapper.Map<User>(userIm);
        user.RegisterDate = DateTime.UtcNow;
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

    public async Task<UserVm?> UpdateProfileAsync(Guid id, ProfileUm profileUm, CancellationToken ct = default)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(e => e.Id == id, cancellationToken: ct);

        if (user == null)
            return null;

        // SetUserNameAsync/SetEmailAsync go through the Identity validators, so a
        // duplicate username or e-mail comes back as an IdentityError rather than a
        // unique-index violation from the database.
        var rename = await userManager.SetUserNameAsync(user, profileUm.Username);
        if (!rename.Succeeded)
            throw new IdentityException(rename.Errors);

        var reEmail = await userManager.SetEmailAsync(user, profileUm.Email);
        if (!reEmail.Succeeded)
            throw new IdentityException(reEmail.Errors);

        return mapper.Map<UserVm>(user);
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

    public async Task<AccountExportVm?> ExportAsync(Guid id, CancellationToken ct = default)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(e => e.Id == id, cancellationToken: ct);

        if (user == null)
            return null;

        var habits = await context.Habits
            .Where(h => h.UserId == id)
            .OrderBy(h => h.CreatedAt)
            .ToListAsync(ct);

        var habitIds = habits.Select(h => h.HabitId).ToList();

        var goals = await context.Goals
            .Where(g => g.UserId == id)
            .OrderBy(g => g.CreatedAt)
            .ToListAsync(ct);

        var logs = await context.HabitLogs
            .Where(l => habitIds.Contains(l.HabitId))
            .OrderBy(l => l.LogDate)
            .ToListAsync(ct);

        return new AccountExportVm
        {
            ExportedAt = DateTime.UtcNow,
            Account = mapper.Map<UserVm>(user),
            Habits = mapper.Map<IEnumerable<HabitVM>>(habits),
            Goals = mapper.Map<IEnumerable<GoalVm>>(goals),
            HabitLogs = mapper.Map<IEnumerable<HabitLogVm>>(logs),
        };
    }
}
