using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SteadySteps.BLL.ServiceInterfaces;
using Microsoft.EntityFrameworkCore;
using SteadySteps.DAL.Models;

namespace SteadySteps.BLL.ServiceImplementations
{
    public class HabitLogService : IHabitLogService
    {
        private readonly DbContext _context;

        public HabitLogService(DbContext context)
        {
            _context = context;
        }

        public async Task<HabitLog> GetHabitLogByIdAsync(int logId)
        {
            return await _context.Set<HabitLog>().FindAsync(logId);
        }

        public async Task<IEnumerable<HabitLog>> GetAllHabitLogsAsync()
        {
            return await _context.Set<HabitLog>().ToListAsync();
        }

        public async Task<HabitLog> CreateHabitLogAsync(HabitLog habitLog)
        {
            _context.Set<HabitLog>().Add(habitLog);
            await _context.SaveChangesAsync();
            return habitLog;
        }

        public async Task<HabitLog> UpdateHabitLogAsync(HabitLog habitLog)
        {
            _context.Set<HabitLog>().Update(habitLog);
            await _context.SaveChangesAsync();
            return habitLog;
        }

        public async Task<bool> DeleteHabitLogAsync(int logId)
        {
            var habitLog = await _context.Set<HabitLog>().FindAsync(logId);
            if (habitLog == null) return false;

            _context.Set<HabitLog>().Remove(habitLog);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}