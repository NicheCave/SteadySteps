using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SteadySteps.DAL.Models;

namespace SteadySteps.BLL.ServiceImplementations
{
    public interface IHabitService
    {
        Task<Habit> GetHabitByIdAsync(int habitId);
        Task<IEnumerable<Habit>> GetAllHabitsAsync();
        Task<Habit> CreateHabitAsync(Habit habit);
        Task<Habit> UpdateHabitAsync(Habit habit);
        Task<bool> DeleteHabitAsync(int habitId);
    }
}