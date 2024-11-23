using Microsoft.AspNetCore.Mvc;
using SteadySteps.BLL.ServiceImplementations;
using SteadySteps.DAL.Models;
using SteadySteps.BLL.ServiceInterfaces;

namespace SteadySteps.PL.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HabitController : ControllerBase
    {
        private readonly IHabitService _habitService;

        public HabitController(IHabitService habitService)
        {
            _habitService = habitService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Habit>> GetHabit(int id)
        {
            var habit = await _habitService.GetHabitByIdAsync(id);
            if (habit == null)
            {
                return NotFound();
            }
            return Ok(habit);
        }

        [HttpPost]
        public async Task<ActionResult<Habit>> CreateHabit(Habit habit)
        {
            var createdHabit = await _habitService.CreateHabitAsync(habit);
            return CreatedAtAction(nameof(GetHabit), new { id = createdHabit.HabitId }, createdHabit);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHabit(int id, Habit habit)
        {
            if (id != habit.HabitId)
            {
                return BadRequest();
            }

            await _habitService.UpdateHabitAsync(habit);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHabit(int id)
        {
            var result = await _habitService.DeleteHabitAsync(id);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}