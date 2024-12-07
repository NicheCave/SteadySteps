using System;
using System.Threading;
using System.Threading.Tasks;
using SteadySteps.BLL.Models.UserDTO;

namespace SteadySteps.BLL.Services.Interfaces;

public interface IUserService
{
    Task<UserVm> CreateUserAsync(UserIm userIm, CancellationToken ct = default);
    Task<UserVm?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> UpdateUserPassword(Guid id, PasswordUm passwordUm);
    Task<bool> SoftDeleteUserAsync(Guid id); 
}