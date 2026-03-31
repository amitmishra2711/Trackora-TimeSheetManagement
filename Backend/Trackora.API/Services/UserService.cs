using Microsoft.EntityFrameworkCore;
using Trackora.API.Data;
using Trackora.API.DTOs;
using Trackora.API.Models;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _db;
        public UserService(AppDbContext db) => _db = db;

        public async Task<PagedResult<UserDto>> GetAllAsync(PaginationQuery query)
        {
            var q = _db.Users.Where(u => !u.IsDeleted);

            if (!string.IsNullOrEmpty(query.Search))
                q = q.Where(u =>
                    u.FirstName.Contains(query.Search) ||
                    u.LastName.Contains(query.Search) ||
                    u.Email.Contains(query.Search));

            var total = await q.CountAsync();

            var items = await q.OrderByDescending(u => u.CreatedAt)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(u => Map(u))
                .ToListAsync();

            return new PagedResult<UserDto>
            {
                Items = items,
                TotalCount = total,
                Page = query.Page,
                PageSize = query.PageSize
            };
        }

        public async Task<UserDto> GetByIdAsync(int id)
        {
            var u = await _db.Users.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted)
                ?? throw new KeyNotFoundException("User not found.");

            return Map(u);
        }

        public async Task<UserDto> CreateAsync(CreateUserDto dto)
        {
            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                throw new InvalidOperationException("Email already in use.");

            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Map(user);
        }

        public async Task<UserDto> UpdateAsync(int id, UpdateUserDto dto)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException("User not found.");

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Email = dto.Email;
            user.Role = dto.Role;
            user.IsActive = dto.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Map(user);
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _db.Users.FindAsync(id)
                ?? throw new KeyNotFoundException("User not found.");

            user.IsDeleted = true;
            await _db.SaveChangesAsync();
        }

        public async Task<List<UserDto>> GetEmployeesAsync() =>
            await _db.Users
                .Where(u => u.Role == "Employee" && !u.IsDeleted && u.IsActive)
                .Select(u => Map(u))
                .ToListAsync();

        public async Task<List<UserDto>> GetLeadersAsync() =>
            await _db.Users
                .Where(u => u.Role == "Leader" && !u.IsDeleted && u.IsActive)
                .Select(u => Map(u))
                .ToListAsync();

        private static UserDto Map(User u) => new()
        {
            Id = u.Id,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Email = u.Email,
            Role = u.Role,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt
        };
    }
}