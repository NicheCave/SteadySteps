using Microsoft.AspNetCore.Mvc;
using SteadySteps.BLL.ServiceImplementations;
using SteadySteps.BLL.ServiceInterfaces;
using SteadySteps.DAL.Models;

namespace SteadySteps.PL.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GoalController : ControllerBase
    {
        private readonly IGoalService _goalService;

        public GoalController(IGoalService goalService)
        {
            _goalService = goalService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Goal>> GetGoal(int id)
        {
            var goal = await _goalService.GetGoalByIdAsync(id);
            if (goal == null)
            {
                return NotFound();
            }
            return Ok(goal);
        }

        [HttpPost]
        public async Task<ActionResult<Goal>> CreateGoal(Goal goal)
        {
            var createdGoal = await _goalService.CreateGoalAsync(goal);
            return CreatedAtAction(nameof(GetGoal), new { id = createdGoal.GoalId }, createdGoal);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGoal(int id, Goal goal)
        {
            if (id != goal.GoalId)
            {
                return BadRequest();
            }

            await _goalService.UpdateGoalAsync(goal);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGoal(int id)
        {
            var result = await _goalService.DeleteGoalAsync(id);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}