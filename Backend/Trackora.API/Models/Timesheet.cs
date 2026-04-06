using System.ComponentModel.DataAnnotations.Schema;

namespace Trackora.API.Models
{
    public class Timesheet
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ProjectId { get; set; }
        public int TaskId { get; set; }
        public DateTime Date { get; set; }
        [Column(TypeName = "decimal(5,2)")] public decimal HoursWorked { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = "Pending"; 
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")] public User User { get; set; } = null!;
        [ForeignKey("ProjectId")] public Project Project { get; set; } = null!;
        [ForeignKey("TaskId")] public TaskItem Task { get; set; } = null!;
    }
}