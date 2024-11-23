using Microsoft.AspNetCore.Mvc;
using SteadySteps.BLL.ServiceImplementations;
using SteadySteps.DAL.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using SteadySteps.BLL.ServiceInterfaces;

namespace SteadySteps.PL.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserHabitsGoalsController : ControllerBase
    {
        private readonly IHabitService _habitService;
        private readonly IGoalService _goalService;
        private readonly IHabitLogService _habitLogService;

        public UserHabitsGoalsController(IHabitService habitService, IGoalService goalService, IHabitLogService habitLogService)
        {
            _habitService = habitService;
            _goalService = goalService;
            _habitLogService = habitLogService;
        }

        [HttpGet("{userId}/habits")]
        public async Task<ActionResult<IEnumerable<Habit>>> GetUserHabits(int userId)
        {
            var habits = await _habitService.GetHabitsByUserIdAsync(userId);
            return Ok(habits);
        }

        [HttpGet("{userId}/goals")]
        public async Task<ActionResult<IEnumerable<Goal>>> GetUserGoals(int userId)
        {
            var goals = await _goalService.GetGoalsByUserIdAsync(userId);
            return Ok(goals);
        }

        [HttpPost("{userId}/habits")]
        public async Task<ActionResult<Habit>> CreateHabit(int userId, Habit habit)
        {
            habit.UserId = userId;
            var createdHabit = await _habitService.CreateHabitAsync(habit);
            return CreatedAtAction(nameof(GetUserHabits), new { userId = userId }, createdHabit);
        }

        [HttpPost("{userId}/goals")]
        public async Task<ActionResult<Goal>> CreateGoal(int userId, Goal goal)
        {
            goal.UserId = userId;
            var createdGoal = await _goalService.CreateGoalAsync(goal);
            return CreatedAtAction(nameof(GetUserGoals), new { userId = userId }, createdGoal);
        }

        [HttpPut("{userId}/habits/{habitId}")]
        public async Task<IActionResult> UpdateHabit(int userId, int habitId, Habit habit)
        {
            if (habitId != habit.HabitId || habit.UserId != userId)
            {
                return BadRequest();
            }

            await _habitService.UpdateHabitAsync(habit);
            return NoContent();
        }

        [HttpPut("{userId}/goals/{goalId}")]
        public async Task<IActionResult> UpdateGoal(int userId, int goalId, Goal goal)
        {
            if (goalId != goal.GoalId || goal.UserId != userId)
            {
                return BadRequest();
            }

            await _goalService.UpdateGoalAsync(goal);
            return NoContent();
        }

        [HttpDelete("{userId}/habits/{habitId}")]
        public async Task<IActionResult> DeleteHabit(int userId, int habitId)
        {
            var habit = await _habitService.GetHabitByIdAsync(habitId);
            if (habit == null || habit.UserId != userId)
            {
                return NotFound();
            }

            await _habitService.DeleteHabitAsync(habitId);
            return NoContent();
        }

        [HttpDelete("{userId}/goals/{goalId}")]
        public async Task<IActionResult> DeleteGoal(int userId, int goalId)
        {
            var goal = await _goalService.GetGoalByIdAsync(goalId);
            if (goal == null || goal.UserId != userId)
            {
                return NotFound();
            }

            await _goalService.DeleteGoalAsync(goalId);
            return NoContent();
        }
    }
}