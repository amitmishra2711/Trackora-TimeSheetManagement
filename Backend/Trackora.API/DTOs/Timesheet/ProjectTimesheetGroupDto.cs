namespace Trackora.API.DTOs
{
    public class ProjectTimesheetGroupDto
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public decimal TotalHours { get; set; }
        public List<TeamTimesheetGroupDto> Teams { get; set; } = new();
    }
}