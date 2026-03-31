using System.ComponentModel.DataAnnotations.Schema;

namespace Trackora.API.Models
{
    public class ReportDetail
    {
        public int Id { get; set; }
        public int ReportId { get; set; }
        public int TaskId { get; set; }
        public string? Notes { get; set; }

        [ForeignKey("ReportId")] public DailyReport Report { get; set; } = null!;
        [ForeignKey("TaskId")] public TaskItem Task { get; set; } = null!;
    }
}