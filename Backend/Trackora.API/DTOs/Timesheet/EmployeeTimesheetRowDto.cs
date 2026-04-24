namespace Trackora.API.DTOs
{
    public class EmployeeTimesheetRowDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string DayOfWeek { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal HoursWorked { get; set; }
        public string TaskTitle { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int TimesheetId { get; set; }
    }
}