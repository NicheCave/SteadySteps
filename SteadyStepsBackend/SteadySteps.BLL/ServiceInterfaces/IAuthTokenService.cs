using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SteadySteps.DAL.Models;

namespace SteadySteps.BLL.ServiceImplementations
{
    public interface IAuthTokenService
    {
        Task<AuthToken> GetAuthTokenByIdAsync(int tokenId);
        Task<IEnumerable<AuthToken>> GetAllAuthTokensAsync();
        Task<AuthToken> CreateAuthTokenAsync(AuthToken authToken);
        Task<AuthToken> UpdateAuthTokenAsync(AuthToken authToken);
        Task<bool> DeleteAuthTokenAsync(int tokenId);
    }
}