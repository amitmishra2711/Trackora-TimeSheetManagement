namespace Trackora.API.DTOs
{
    public class DailyReportDto
    {
        public int Id { get; set; }
        public int TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public int LeaderId { get; set; }
        public string LeaderName { get; set; } = string.Empty;
        public DateTime ReportDate { get; set; }
        public string Summary { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
        public List<ReportDetailDto> Details { get; set; } = new();
    }
}