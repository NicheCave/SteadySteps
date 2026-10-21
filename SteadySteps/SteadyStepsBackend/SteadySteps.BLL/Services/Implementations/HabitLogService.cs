using AutoMapper;
using SteadySteps.BLL.Models.InputDTO;
using SteadySteps.BLL.Models.ViewDTO;
using SteadySteps.BLL.Services.Interfaces;
using SteadySteps.DAL.Data;
using SteadySteps.DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace SteadySteps.BLL.Services.Implementations;

public class HabitLogService(SteadyStepsDbContext context, ICurrentUser currentUser, IMapper mapper) : IHabitLogService
{
    public async Task<IEnumerable<HabitLogVm>> GetAllForCurrentUserAsync(Guid? habitId, CancellationToken ct = default)
    {
        var logs = await context.HabitLogs
            .Where(hl => hl.Habit.UserId == currentUser.User.Id && (habitId == null || hl.HabitId == habitId))
            .ToListAsync(ct);

        return mapper.Map<IEnumerable<HabitLogVm>>(logs);
    }

    public async Task<HabitLogVm?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var log = await context.HabitLogs
            .FirstOrDefaultAsync(hl => hl.LogId == id && hl.Habit.UserId == currentUser.User.Id, ct);

        return log == null ? null : mapper.Map<HabitLogVm>(log);
    }

    public async Task<HabitLogVm?> CreateAsync(HabitLogIm habitLogIm, CancellationToken ct = default)
    {
        var ownsHabit = await context.Habits
            .AnyAsync(h => h.HabitId == habitLogIm.HabitId && h.UserId == currentUser.User.Id, ct);

        if (!ownsHabit)
            return null;

        var log = mapper.Map<HabitLog>(habitLogIm);

        context.HabitLogs.Add(log);
        await context.SaveChangesAsync(ct);

        return mapper.Map<HabitLogVm>(log);
    }

    public async Task<HabitLogVm?> UpdateAsync(Guid id, HabitLogIm habitLogIm, CancellationToken ct = default)
    {
        var log = await context.HabitLogs
            .FirstOrDefaultAsync(hl => hl.LogId == id && hl.Habit.UserId == currentUser.User.Id, ct);

        if (log == null)
            return null;

        var ownsHabit = await context.Habits
            .AnyAsync(h => h.HabitId == habitLogIm.HabitId && h.UserId == currentUser.User.Id, ct);

        if (!ownsHabit)
            return null;

        mapper.Map(habitLogIm, log);

        await context.SaveChangesAsync(ct);

        return mapper.Map<HabitLogVm>(log);
    }

    public async Task<bool> SoftDeleteAsync(Guid id, CancellationToken ct = default)
    {
        var log = await context.HabitLogs
            .FirstOrDefaultAsync(hl => hl.LogId == id && hl.Habit.UserId == currentUser.User.Id, ct);

        if (log == null)
            return false;

        log.IsDeleted = true;
        await context.SaveChangesAsync(ct);

        return true;
    }
}
