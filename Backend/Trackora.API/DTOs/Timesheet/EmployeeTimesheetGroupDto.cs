namespace Trackora.API.DTOs
{
     public class EmployeeTimesheetGroupDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public decimal TotalHours { get; set; }
        public List<EmployeeTimesheetRowDto> Entries { get; set; } = new();
    }
}