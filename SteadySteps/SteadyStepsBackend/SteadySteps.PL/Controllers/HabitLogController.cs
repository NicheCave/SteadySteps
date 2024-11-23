using Microsoft.AspNetCore.Mvc;
using SteadySteps.BLL.ServiceImplementations;
using SteadySteps.DAL.Models;
using SteadySteps.BLL.ServiceInterfaces;

namespace SteadySteps.PL.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HabitLogController : ControllerBase
    {
        private readonly IHabitLogService _habitLogService;

        public HabitLogController(IHabitLogService habitLogService)
        {
            _habitLogService = habitLogService;
        }

        [HttpGet("{logId}")]
        public async Task<ActionResult<HabitLog>> GetHabitLog(int logId)
        {
            var habitLog = await _habitLogService.GetHabitLogByIdAsync(logId);
            if (habitLog == null)
            {
                return NotFound();
            }
            return Ok(habitLog);
        }

        [HttpPost]
        public async Task<ActionResult<HabitLog>> CreateHabitLog(HabitLog habitLog)
        {
            var createdHabitLog = await _habitLogService.CreateHabitLogAsync(habitLog);
            return CreatedAtAction(nameof(GetHabitLog), new { logId = createdHabitLog.LogId }, createdHabitLog);
        }

        [HttpPut("{logId}")]
        public async Task<IActionResult> UpdateHabitLog(int logId, HabitLog habitLog)
        {
            if (logId != habitLog.LogId)
            {
                return BadRequest();
            }

            await _habitLogService.UpdateHabitLogAsync(habitLog);
            return NoContent();
        }

        [HttpDelete("{logId}")]
        public async Task<IActionResult> DeleteHabitLog(int logId)
        {
            var result = await _habitLogService.DeleteHabitLogAsync(logId);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}