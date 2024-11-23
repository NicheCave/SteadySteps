using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SteadySteps.DAL.Models;

namespace SteadySteps.BLL.ServiceInterfaces
{
    public interface IGoalService
    {
        Task<IEnumerable<Goal>> GetGoalsByUserIdAsync(int userId);
        Task<Goal> GetGoalByIdAsync(int goalId);
        Task<IEnumerable<Goal>> GetAllGoalsAsync();
        Task<Goal> CreateGoalAsync(Goal goal);
        Task<Goal> UpdateGoalAsync(Goal goal);
        Task<bool> DeleteGoalAsync(int goalId);
    }
}