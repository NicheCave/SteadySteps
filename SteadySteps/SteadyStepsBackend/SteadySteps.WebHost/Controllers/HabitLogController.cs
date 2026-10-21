using SteadySteps.BLL.Models.InputDTO;
using SteadySteps.BLL.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace SteadySteps.WebHost.Controllers;

[Route("api/[controller]")]
[ApiController]
public class HabitLogController(
    IHabitLogService habitLogService,
    IAuthService authService,
    ICurrentUser currentUser)
    : BaseController(authService, currentUser)
{
    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] Guid? habitId, CancellationToken ct = default)
    {
        return Json(await habitLogService.GetAllForCurrentUserAsync(habitId, ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var log = await habitLogService.GetByIdAsync(id, ct);
        return log == null ? NotFound() : Json(log);
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] HabitLogIm habitLogIm, CancellationToken ct = default)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var log = await habitLogService.CreateAsync(habitLogIm, ct);
        return log == null ? NotFound() : Json(log);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> Update(Guid id, [FromBody] HabitLogIm habitLogIm, CancellationToken ct = default)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var log = await habitLogService.UpdateAsync(id, habitLogIm, ct);
        return log == null ? NotFound() : Json(log);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken ct = default)
    {
        var deleted = await habitLogService.SoftDeleteAsync(id, ct);
        return deleted ? Ok() : NotFound();
    }
}
