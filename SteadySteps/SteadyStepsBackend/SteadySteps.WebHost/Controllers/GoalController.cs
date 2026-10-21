using SteadySteps.BLL.Models.InputDTO;
using SteadySteps.BLL.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace SteadySteps.WebHost.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GoalController(
    IGoalService goalService,
    IAuthService authService,
    ICurrentUser currentUser)
    : BaseController(authService, currentUser)
{
    [HttpGet]
    public async Task<ActionResult> GetAll(CancellationToken ct = default)
    {
        return Json(await goalService.GetAllForCurrentUserAsync(ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var goal = await goalService.GetByIdAsync(id, ct);
        return goal == null ? NotFound() : Json(goal);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] GoalIm goalIm, CancellationToken ct = default)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var goal = await goalService.CreateAsync(goalIm, ct);
        return goal == null ? NotFound() : Json(goal);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] GoalIm goalIm, CancellationToken ct = default)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var goal = await goalService.UpdateAsync(id, goalIm, ct);
        return goal == null ? NotFound() : Json(goal);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken ct = default)
    {
        var deleted = await goalService.SoftDeleteAsync(id, ct);
        return deleted ? Ok() : NotFound();
    }
}
