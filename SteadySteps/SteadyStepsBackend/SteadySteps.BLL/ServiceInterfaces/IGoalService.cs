using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SteadySteps.DAL.Models;

namespace SteadySteps.BLL.ServiceImplementations
{
    public interface IGoalService
    {
        Task<Goal> GetGoalByIdAsync(int goalId);
        Task<IEnumerable<Goal>> GetAllGoalsAsync();
        Task<Goal> CreateGoalAsync(Goal goal);
        Task<Goal> UpdateGoalAsync(Goal goal);
        Task<bool> DeleteGoalAsync(int goalId);
    }
}