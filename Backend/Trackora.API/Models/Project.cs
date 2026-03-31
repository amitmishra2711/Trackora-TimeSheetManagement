using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Trackora.API.Models
{
    public class Project
    {
        public int Id { get; set; }
        [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "Active"; // Active, Completed, OnHold
        public int CreatedBy { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("CreatedBy")] public User Creator { get; set; } = null!;
        public ICollection<ProjectTeam> ProjectTeams { get; set; } = new List<ProjectTeam>();
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
        public ICollection<Timesheet> Timesheets { get; set; } = new List<Timesheet>();
    }
}