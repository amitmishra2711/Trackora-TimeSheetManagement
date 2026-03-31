using System.ComponentModel.DataAnnotations.Schema;

namespace Trackora.API.Models
{
    public class DailyReport
    {
        public int Id { get; set; }
        public int TeamId { get; set; }
        public int LeaderId { get; set; }
        public DateTime ReportDate { get; set; }
        public string Summary { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("TeamId")] public Team Team { get; set; } = null!;
        [ForeignKey("LeaderId")] public User Leader { get; set; } = null!;
        public ICollection<ReportDetail> ReportDetails { get; set; } = new List<ReportDetail>();
    }
}