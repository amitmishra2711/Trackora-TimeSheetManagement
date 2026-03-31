namespace Trackora.API.DTOs
{
    public class TimesheetDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public int TaskId { get; set; }
        public string TaskTitle { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal HoursWorked { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool CanEdit { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}