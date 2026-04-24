namespace Trackora.API.DTOs
{
    public class UpdateTimesheetDto
    {
        public decimal HoursWorked { get; set; }
        public string? Description { get; set; }
    public int TaskId { get; set; }
    public int ProjectId { get; set; }
    }
}   