using System.Collections.Generic;
using System.Threading.Tasks;
using SteadySteps.DAL.Models;
using SteadySteps.DTO;
using SteadySteps.DTO.Objects;

namespace SteadySteps.BLL.ServiceInterfaces
{
    public interface IUserService
    {
        Task<UserDto> GetUserByIdAsync(int userId);
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User> CreateUserAsync(User user);
        Task<User> UpdateUserAsync(User user);
        Task<bool> DeleteUserAsync(int userId);
    }
}