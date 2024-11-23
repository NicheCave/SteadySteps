using Microsoft.AspNetCore.Mvc;
using SteadySteps.BLL.ServiceImplementations;
using SteadySteps.DAL.Models;
using SteadySteps.BLL.ServiceInterfaces;

namespace SteadySteps.PL.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthTokenController : ControllerBase
    {
        private readonly IAuthTokenService _authTokenService;

        public AuthTokenController(IAuthTokenService authTokenService)
        {
            _authTokenService = authTokenService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AuthToken>> GetAuthToken(int id)
        {
            var authToken = await _authTokenService.GetAuthTokenByIdAsync(id);
            if (authToken == null)
            {
                return NotFound();
            }
            return Ok(authToken);
        }

        [HttpPost]
        public async Task<ActionResult<AuthToken>> CreateAuthToken(AuthToken authToken)
        {
            var createdAuthToken = await _authTokenService.CreateAuthTokenAsync(authToken);
            return CreatedAtAction(nameof(GetAuthToken), new { id = createdAuthToken.TokenId }, createdAuthToken);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAuthToken(int id, AuthToken authToken)
        {
            if (id != authToken.TokenId)
            {
                return BadRequest();
            }

            await _authTokenService.UpdateAuthTokenAsync(authToken);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAuthToken(int id)
        {
            var result = await _authTokenService.DeleteAuthTokenAsync(id);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}