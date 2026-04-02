using System.ComponentModel.DataAnnotations;

namespace Trackora.API.Models
{
    public class User
    {
        public int Id { get; set; }
        [Required, MaxLength(100)] public string FirstName { get; set; } = string.Empty;
        [Required, MaxLength(100)] public string LastName { get; set; } = string.Empty;
        [Required, MaxLength(200)] public string Email { get; set; } = string.Empty;
        [Required] public string PasswordHash { get; set; } = string.Empty;
        [Required] public string Role { get; set; } = "Employee"; // Admin, Leader, Employee
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<TeamMember> TeamMemberships { get; set; } = new List<TeamMember>();
        public ICollection<Team> LeadingTeams { get; set; } = new List<Team>();
        public ICollection<Timesheet> Timesheets { get; set; } = new List<Timesheet>();
    }
}