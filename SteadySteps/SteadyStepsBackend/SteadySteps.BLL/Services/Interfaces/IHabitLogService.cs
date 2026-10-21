using SteadySteps.BLL.Models.InputDTO;
using SteadySteps.BLL.Models.ViewDTO;

namespace SteadySteps.BLL.Services.Interfaces;

public interface IHabitLogService
{
    Task<IEnumerable<HabitLogVm>> GetAllForCurrentUserAsync(Guid? habitId, CancellationToken ct = default);
    Task<HabitLogVm?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<HabitLogVm?> CreateAsync(HabitLogIm habitLogIm, CancellationToken ct = default);
    Task<HabitLogVm?> UpdateAsync(Guid id, HabitLogIm habitLogIm, CancellationToken ct = default);
    Task<bool> SoftDeleteAsync(Guid id, CancellationToken ct = default);
}
