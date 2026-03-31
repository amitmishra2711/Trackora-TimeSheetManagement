namespace Trackora.API.DTOs
{
    public class CreateDailyReportDto
    {
        public int TeamId { get; set; }
        public DateTime ReportDate { get; set; }
        public string Summary { get; set; } = string.Empty;
        public List<CreateReportDetailDto> Details { get; set; } = new();
    }
}