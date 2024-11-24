using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SteadySteps.BLL.ServiceInterfaces;
using Microsoft.EntityFrameworkCore;
using SteadySteps.DAL.Data;
using SteadySteps.DAL.Models;

namespace SteadySteps.BLL.ServiceImplementations
{
    public class AuthTokenService : IAuthTokenService
    {
        private readonly SteadyStepsDbContext _context;

        public AuthTokenService(SteadyStepsDbContext context)
        {
            _context = context;
        }

        public async Task<AuthToken> GetAuthTokenByIdAsync(int tokenId)
        {
            return await _context.Set<AuthToken>().FindAsync(tokenId);
        }

        public async Task<IEnumerable<AuthToken>> GetAllAuthTokensAsync()
        {
            return await _context.Set<AuthToken>().ToListAsync();
        }

        public async Task<AuthToken> CreateAuthTokenAsync(AuthToken authToken)
        {
            _context.Set<AuthToken>().Add(authToken);
            await _context.SaveChangesAsync();
            return authToken;
        }

        public async Task<AuthToken> UpdateAuthTokenAsync(AuthToken authToken)
        {
            _context.Set<AuthToken>().Update(authToken);
            await _context.SaveChangesAsync();
            return authToken;
        }

        public async Task<bool> DeleteAuthTokenAsync(int tokenId)
        {
            var authToken = await _context.Set<AuthToken>().FindAsync(tokenId);
            if (authToken == null) return false;

            _context.Set<AuthToken>().Remove(authToken);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}