using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SteadySteps.DAL.Models;
using SteadySteps.BLL.ServiceInterfaces;
using SteadySteps.DAL.Data;

namespace SteadySteps.BLL.ServiceImplementations
{
    public class HabitService : IHabitService
    {
        private readonly SteadyStepsDbContext _context;

        public HabitService(SteadyStepsDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Habit>> GetHabitsByUserIdAsync(int userId)
        {
            return await _context.Set<Habit>().Where(h => h.UserId == userId).ToListAsync();
        }

        public async Task<Habit> GetHabitByIdAsync(int habitId)
        {
            return await _context.Set<Habit>().FindAsync(habitId);
        }

        public async Task<Habit> CreateHabitAsync(Habit habit)
        {
            _context.Set<Habit>().Add(habit);
            await _context.SaveChangesAsync();
            return habit;
        }

        public async Task UpdateHabitAsync(Habit habit)
        {
            _context.Entry(habit).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task<bool> DeleteHabitAsync(int habitId)
        {
            var habit = await _context.Set<Habit>().FindAsync(habitId);
            if (habit == null)
            {
                return false;
            }

            _context.Set<Habit>().Remove(habit);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}