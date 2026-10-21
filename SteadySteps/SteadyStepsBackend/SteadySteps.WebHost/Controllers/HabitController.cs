using SteadySteps.BLL.Models.InputDTO;
using SteadySteps.BLL.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace SteadySteps.WebHost.Controllers;

[Route("api/[controller]")]
[ApiController]
public class HabitController(
    IHabitService habitService,
    IAuthService authService,
    ICurrentUser currentUser)
    : BaseController(authService, currentUser)
{
    [HttpGet]
    public async Task<ActionResult> GetAll(CancellationToken ct = default)
    {
        return Json(await habitService.GetAllForCurrentUserAsync(ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var habit = await habitService.GetByIdAsync(id, ct);
        return habit == null ? NotFound() : Json(habit);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] HabitIm habitIm, CancellationToken ct = default)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        return Json(await habitService.CreateAsync(habitIm, ct));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] HabitIm habitIm, CancellationToken ct = default)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var habit = await habitService.UpdateAsync(id, habitIm, ct);
        return habit == null ? NotFound() : Json(habit);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken ct = default)
    {
        var deleted = await habitService.SoftDeleteAsync(id, ct);
        return deleted ? Ok() : NotFound();
    }
}
