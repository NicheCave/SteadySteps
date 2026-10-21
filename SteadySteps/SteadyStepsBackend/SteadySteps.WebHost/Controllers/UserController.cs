using SteadySteps.BLL;
using SteadySteps.BLL.Models.UserDTO;
using SteadySteps.BLL.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace SteadySteps.WebHost.Controllers;

/// <summary>Account management for the signed-in user — everything behind the Settings tab.</summary>
[Route("api/[controller]/[action]")]
[ApiController]
public class UserController(
    IUserService userService,
    IAuthService authService,
    ICurrentUser currentUser,
    ILogger<UserController> logger)
    : BaseController(authService, currentUser)
{
    private readonly IAuthService _authService = authService;
    private readonly ICurrentUser _currentUser = currentUser;

    [HttpPut]
    public async Task<ActionResult<UserVm>> Profile([FromBody] ProfileUm profileUm, CancellationToken ct = default)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var user = await userService.UpdateProfileAsync(_currentUser.User.Id, profileUm, ct);

            if (user == null)
                return NotFound();

            await _authService.RefreshSignInAsync(_currentUser.User, ct);
            return Json(user);
        }
        catch (IdentityException e)
        {
            return ValidationProblem(detail: e.Message, type: "invalid-profile-data");
        }
        catch (Exception e)
        {
            logger.LogError(e, "Unexpected error while updating a profile.");
            return ValidationProblem(
                detail: "An unexpected error occurred while saving your profile. Please try again.",
                type: "invalid-profile-data");
        }
    }

    [HttpPut]
    public async Task<ActionResult> Password([FromBody] PasswordUm passwordUm, CancellationToken ct = default)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var changed = await userService.UpdateUserPassword(_currentUser.User.Id, passwordUm);

            if (!changed)
                return NotFound();

            await _authService.RefreshSignInAsync(_currentUser.User, ct);
            return Ok();
        }
        catch (IdentityException e)
        {
            return ValidationProblem(detail: e.Message, type: "invalid-password-change");
        }
    }

    [HttpGet]
    public async Task<ActionResult> Export(CancellationToken ct = default)
    {
        var export = await userService.ExportAsync(_currentUser.User.Id, ct);
        return export == null ? NotFound() : Json(export);
    }

    [HttpDelete]
    public async Task<ActionResult> Account(CancellationToken ct = default)
    {
        var deleted = await userService.SoftDeleteUserAsync(_currentUser.User.Id);

        if (!deleted)
            return NotFound();

        // The account is gone as far as the app is concerned, so drop the cookie
        // too — otherwise the caller keeps a session pointing at a filtered-out user.
        await _authService.SignOutAsync(ct);
        return Ok();
    }
}
