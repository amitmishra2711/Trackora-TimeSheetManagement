using System.ComponentModel.DataAnnotations.Schema;

namespace Trackora.API.Models
{
    public class ExportLog
    {
        public int Id { get; set; }
        public int AdminId { get; set; }
        public string ExportType { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("AdminId")] public User Admin { get; set; } = null!;
    }
}