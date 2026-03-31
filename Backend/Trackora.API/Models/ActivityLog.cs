using System.ComponentModel.DataAnnotations.Schema;

namespace Trackora.API.Models
{
    public class ActivityLog
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string? Details { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")] public User User { get; set; } = null!;
    }
}