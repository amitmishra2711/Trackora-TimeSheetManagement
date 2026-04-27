namespace Trackora.API.DTOs
{
     public class TimesheetAnalyticsDto
    {
        public WeeklySummaryDto Summary { get; set; } = new();
        public List<ProjectTimesheetGroupDto> Grouped { get; set; } = new();
    public List<EmployeeTimesheetRowDto> Rows { get; set; } = new();
        public int TotalRecords { get; set; }
    }
}