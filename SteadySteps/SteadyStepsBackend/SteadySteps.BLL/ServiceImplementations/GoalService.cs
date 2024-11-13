using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SteadySteps.DAL.Models;

namespace SteadySteps.BLL.ServiceImplementations
{
    public class GoalService : IGoalService
    {
        private readonly DbContext _context;

        public GoalService(DbContext context)
        {
            _context = context;
        }

        public async Task<Goal> GetGoalByIdAsync(int goalId)
        {
            return await _context.Set<Goal>().FindAsync(goalId);
        }

        public async Task<IEnumerable<Goal>> GetAllGoalsAsync()
        {
            return await _context.Set<Goal>().ToListAsync();
        }

        public async Task<Goal> CreateGoalAsync(Goal goal)
        {
            _context.Set<Goal>().Add(goal);
            await _context.SaveChangesAsync();
            return goal;
        }

        public async Task<Goal> UpdateGoalAsync(Goal goal)
        {
            _context.Set<Goal>().Update(goal);
            await _context.SaveChangesAsync();
            return goal;
        }

        public async Task<bool> DeleteGoalAsync(int goalId)
        {
            var goal = await _context.Set<Goal>().FindAsync(goalId);
            if (goal == null) return false;

            _context.Set<Goal>().Remove(goal);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}