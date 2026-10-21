using AutoMapper;
using SteadySteps.BLL.Models.InputDTO;
using SteadySteps.BLL.Models.ViewDTO;
using SteadySteps.BLL.Services.Interfaces;
using SteadySteps.DAL.Data;
using SteadySteps.DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace SteadySteps.BLL.Services.Implementations;

public class GoalService(SteadyStepsDbContext context, ICurrentUser currentUser, IMapper mapper) : IGoalService
{
    public async Task<IEnumerable<GoalVm>> GetAllForCurrentUserAsync(CancellationToken ct = default)
    {
        var goals = await context.Goals
            .Where(g => g.UserId == currentUser.User.Id)
            .ToListAsync(ct);

        return mapper.Map<IEnumerable<GoalVm>>(goals);
    }

    public async Task<GoalVm?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var goal = await context.Goals
            .FirstOrDefaultAsync(g => g.GoalId == id && g.UserId == currentUser.User.Id, ct);

        return goal == null ? null : mapper.Map<GoalVm>(goal);
    }

    public async Task<GoalVm?> CreateAsync(GoalIm goalIm, CancellationToken ct = default)
    {
        var ownsHabit = await context.Habits
            .AnyAsync(h => h.HabitId == goalIm.HabitId && h.UserId == currentUser.User.Id, ct);

        if (!ownsHabit)
            return null;

        var goal = mapper.Map<Goal>(goalIm);
        goal.UserId = currentUser.User.Id;
        goal.CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        context.Goals.Add(goal);
        await context.SaveChangesAsync(ct);

        return mapper.Map<GoalVm>(goal);
    }

    public async Task<GoalVm?> UpdateAsync(Guid id, GoalIm goalIm, CancellationToken ct = default)
    {
        var goal = await context.Goals
            .FirstOrDefaultAsync(g => g.GoalId == id && g.UserId == currentUser.User.Id, ct);

        if (goal == null)
            return null;

        var ownsHabit = await context.Habits
            .AnyAsync(h => h.HabitId == goalIm.HabitId && h.UserId == currentUser.User.Id, ct);

        if (!ownsHabit)
            return null;

        mapper.Map(goalIm, goal);

        await context.SaveChangesAsync(ct);

        return mapper.Map<GoalVm>(goal);
    }

    public async Task<bool> SoftDeleteAsync(Guid id, CancellationToken ct = default)
    {
        var goal = await context.Goals
            .FirstOrDefaultAsync(g => g.GoalId == id && g.UserId == currentUser.User.Id, ct);

        if (goal == null)
            return false;

        goal.IsDeleted = true;
        await context.SaveChangesAsync(ct);

        return true;
    }
}
