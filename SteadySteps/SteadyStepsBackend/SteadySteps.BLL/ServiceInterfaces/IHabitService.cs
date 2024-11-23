using System.Collections.Generic;
using System.Threading.Tasks;
using SteadySteps.DAL.Models;

namespace SteadySteps.BLL.ServiceInterfaces
{
    public interface IHabitService
    {
        Task<IEnumerable<Habit>> GetHabitsByUserIdAsync(int userId);
        Task<Habit> GetHabitByIdAsync(int habitId);
        Task<Habit> CreateHabitAsync(Habit habit);
        Task UpdateHabitAsync(Habit habit);
        Task<bool> DeleteHabitAsync(int habitId);
    }
}