namespace Trackora.API.DTOs
{
     public class EmployeeTimesheetRowDto
    {
        public int TimesheetId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public int TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public string TaskTitle { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string DayOfWeek { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal HoursWorked { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}