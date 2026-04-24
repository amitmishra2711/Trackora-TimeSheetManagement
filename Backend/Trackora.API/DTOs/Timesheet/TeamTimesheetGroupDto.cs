namespace Trackora.API.DTOs
{
    public class TeamTimesheetGroupDto
    {
        public int TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public decimal TotalHours { get; set; }
        public List<EmployeeTimesheetGroupDto> Employees { get; set; } = new();
    }
}