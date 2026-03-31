namespace Trackora.API.DTOs
{
    public class CreateTimesheetDto
    {
        public int ProjectId { get; set; }
        public int TaskId { get; set; }
        public DateTime Date { get; set; }
        public decimal HoursWorked { get; set; }
        public string? Description { get; set; }
    }
}