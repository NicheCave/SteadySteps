using SteadySteps.BLL.Models.InputDTO;
using SteadySteps.BLL.Models.ViewDTO;

namespace SteadySteps.BLL.Services.Interfaces;

public interface IGoalService
{
    Task<IEnumerable<GoalVm>> GetAllForCurrentUserAsync(CancellationToken ct = default);
    Task<GoalVm?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<GoalVm?> CreateAsync(GoalIm goalIm, CancellationToken ct = default);
    Task<GoalVm?> UpdateAsync(Guid id, GoalIm goalIm, CancellationToken ct = default);
    Task<bool> SoftDeleteAsync(Guid id, CancellationToken ct = default);
}
