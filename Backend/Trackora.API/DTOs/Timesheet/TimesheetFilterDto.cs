 namespace Trackora.API.DTOs
{
 public class TimesheetFilterDto
    {
        public int? EmployeeId { get; set; }
        public int? ProjectId { get; set; }
        public int? TeamId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

}
