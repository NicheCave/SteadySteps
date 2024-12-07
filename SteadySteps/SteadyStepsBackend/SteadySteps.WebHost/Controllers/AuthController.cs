using AutoMapper;
using SteadySteps.BLL.Services.Interfaces;
using SteadySteps.BLL.Models.UserDTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SteadySteps.BLL;

namespace SteadySteps.WebHost.Controllers;

[Route("api/[controller]/[action]")]
[ApiController]
public class AuthController(
    IUserService userService,
    IAuthService authService,
    ICurrentUser currentUser,
    IMapper mapper)
    : BaseController(authService, currentUser)
{
    private readonly IAuthService _authService = authService;
    private readonly ICurrentUser _currentUser = currentUser;

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<UserVm>> Register([FromBody] UserIm userIm, CancellationToken ct = default)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var user = await userService.CreateUserAsync(userIm, ct);
            return Json(user);
        }
        catch (Exception e)
        {
            return ValidationProblem(detail: e.Message, type: "invalid-user-register-data");
        }
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult> Login([FromBody] UserLoginIm loginIm, CancellationToken ct = default)
    {
        try
        {
            await _authService.SignInAsync(loginIm, ct);
        }
        catch (IdentityException e)
        {
            return ValidationProblem(detail: e.Message, type: "invalid-login-details");
        }

        return Ok();
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult> Logout(CancellationToken ct = default)
    {
        await _authService.SignOutAsync(ct);
        return Ok();
    }

    [HttpGet]
#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
    public async Task<ActionResult<UserVm>> Self(CancellationToken ct = default)
    {
        return Json(mapper.Map<UserVm>(_currentUser.User));
    }
}