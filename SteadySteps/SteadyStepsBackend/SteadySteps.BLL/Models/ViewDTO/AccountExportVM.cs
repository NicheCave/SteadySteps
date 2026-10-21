using SteadySteps.BLL.Models.UserDTO;

namespace SteadySteps.BLL.Models.ViewDTO;

/// <summary>Everything the signed-in user has stored, in one downloadable document.</summary>
public class AccountExportVm
{
    public DateTime ExportedAt { get; set; }

    public UserVm Account { get; set; } = null!;

    public IEnumerable<HabitVM> Habits { get; set; } = [];

    public IEnumerable<GoalVm> Goals { get; set; } = [];

    public IEnumerable<HabitLogVm> HabitLogs { get; set; } = [];
}
