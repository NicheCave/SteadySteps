using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SteadySteps.DAL.Models;

namespace SteadySteps.BLL.ServiceImplementations
{
    public interface IHabitLogService
    {
        Task<HabitLog> GetHabitLogByIdAsync(int logId);
        Task<IEnumerable<HabitLog>> GetAllHabitLogsAsync();
        Task<HabitLog> CreateHabitLogAsync(HabitLog habitLog);
        Task<HabitLog> UpdateHabitLogAsync(HabitLog habitLog);
        Task<bool> DeleteHabitLogAsync(int logId);
    }
}