namespace Trackora.API.DTOs
{
    public class ReportDetailDto
    {
        public int Id { get; set; }
        public int TaskId { get; set; }
        public string TaskTitle { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}