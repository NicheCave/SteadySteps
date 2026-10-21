using SteadySteps.BLL.Models.InputDTO;
using SteadySteps.BLL.Models.ViewDTO;

namespace SteadySteps.BLL.Services.Interfaces;

public interface IHabitService
{
    Task<IEnumerable<HabitVM>> GetAllForCurrentUserAsync(CancellationToken ct = default);
    Task<HabitVM?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<HabitVM> CreateAsync(HabitIm habitIm, CancellationToken ct = default);
    Task<HabitVM?> UpdateAsync(Guid id, HabitIm habitIm, CancellationToken ct = default);
    Task<bool> SoftDeleteAsync(Guid id, CancellationToken ct = default);
}
