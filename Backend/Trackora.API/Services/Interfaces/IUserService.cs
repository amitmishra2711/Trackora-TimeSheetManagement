using Trackora.API.DTOs;

namespace Trackora.API.Services.Interfaces
{
    public interface IUserService
    {
        Task<PagedResult<UserDto>> GetAllAsync(PaginationQuery query);
        Task<UserDto> GetByIdAsync(int id);
        Task<UserDto> CreateAsync(CreateUserDto dto);
        Task<UserDto> UpdateAsync(int id, UpdateUserDto dto);
        Task DeleteAsync(int id);
        Task<List<UserDto>> GetEmployeesAsync();
        Task<List<UserDto>> GetLeadersAsync();
    }
}