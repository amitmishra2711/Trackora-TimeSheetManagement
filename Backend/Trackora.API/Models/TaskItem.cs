using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Trackora.API.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        [Required, MaxLength(300)] public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int ProjectId { get; set; }
        public int AssignedTo { get; set; }
        public int AssignedBy { get; set; }
        public string Priority { get; set; } = "Medium"; 
        public string Status { get; set; } = "Todo"; 
        public DateTime? DueDate { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ProjectId")] public Project Project { get; set; } = null!;
        [ForeignKey("AssignedTo")] public User AssignedToUser { get; set; } = null!;
        [ForeignKey("AssignedBy")] public User AssignedByUser { get; set; } = null!;
        public ICollection<Timesheet> Timesheets { get; set; } = new List<Timesheet>();
    }
}