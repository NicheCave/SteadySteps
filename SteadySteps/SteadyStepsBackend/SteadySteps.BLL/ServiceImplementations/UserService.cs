using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using Microsoft.EntityFrameworkCore;
using SteadySteps.DTO.Objects;
using SteadySteps.DAL.Models;
using SteadySteps.BLL.ServiceInterfaces;
using SteadySteps.DAL.Data;
using SteadySteps.DTO;

namespace SteadySteps.BLL.ServiceImplementations
{
    public class UserService : IUserService
    {
        private readonly SteadyStepsDbContext _context;

        public UserService(SteadyStepsDbContext context)
        {
            _context = context;
        }

        public async Task<UserDto> GetUserByIdAsync(int userId)
        {
            var user = await _context.Users.Include(u => u.AuthTokens).FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return null;

            return new UserDto
            {
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role
            };
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Set<User>().ToListAsync();
        }

        public async Task<User> CreateUserAsync(string username, string email, string password)
        {
            byte[] salt = new byte[128 / 8];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }
            string hashedPassword = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                password: password,
                salt: salt,
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 10000,
                numBytesRequested: 256 / 8));

            var user = new User
            {
                Username = username,
                Email = email,
                PasswordHash = hashedPassword,
                Role = "user",
                RegisterDate = DateTime.UtcNow,
                LastLogin = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<User> UpdateUserAsync(User user)
        {
            _context.Set<User>().Update(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _context.Set<User>().FindAsync(userId);
            if (user == null) return false;

            _context.Set<User>().Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}