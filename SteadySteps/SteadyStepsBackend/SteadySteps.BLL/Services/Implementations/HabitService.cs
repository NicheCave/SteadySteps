using AutoMapper;
using SteadySteps.BLL.Models.InputDTO;
using SteadySteps.BLL.Models.ViewDTO;
using SteadySteps.BLL.Services.Interfaces;
using SteadySteps.DAL.Data;
using SteadySteps.DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace SteadySteps.BLL.Services.Implementations;

public class HabitService(SteadyStepsDbContext context, ICurrentUser currentUser, IMapper mapper) : IHabitService
{
    public async Task<IEnumerable<HabitVM>> GetAllForCurrentUserAsync(CancellationToken ct = default)
    {
        var habits = await context.Habits
            .Where(h => h.UserId == currentUser.User.Id)
            .ToListAsync(ct);

        return mapper.Map<IEnumerable<HabitVM>>(habits);
    }

    public async Task<HabitVM?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var habit = await context.Habits
            .FirstOrDefaultAsync(h => h.HabitId == id && h.UserId == currentUser.User.Id, ct);

        return habit == null ? null : mapper.Map<HabitVM>(habit);
    }

    public async Task<HabitVM> CreateAsync(HabitIm habitIm, CancellationToken ct = default)
    {
        var habit = mapper.Map<Habit>(habitIm);
        habit.UserId = currentUser.User.Id;
        habit.CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        context.Habits.Add(habit);
        await context.SaveChangesAsync(ct);

        return mapper.Map<HabitVM>(habit);
    }

    public async Task<HabitVM?> UpdateAsync(Guid id, HabitIm habitIm, CancellationToken ct = default)
    {
        var habit = await context.Habits
            .FirstOrDefaultAsync(h => h.HabitId == id && h.UserId == currentUser.User.Id, ct);

        if (habit == null)
            return null;

        mapper.Map(habitIm, habit);
        habit.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);

        await context.SaveChangesAsync(ct);

        return mapper.Map<HabitVM>(habit);
    }

    public async Task<bool> SoftDeleteAsync(Guid id, CancellationToken ct = default)
    {
        var habit = await context.Habits
            .FirstOrDefaultAsync(h => h.HabitId == id && h.UserId == currentUser.User.Id, ct);

        if (habit == null)
            return false;

        habit.IsDeleted = true;
        await context.SaveChangesAsync(ct);

        return true;
    }
}
