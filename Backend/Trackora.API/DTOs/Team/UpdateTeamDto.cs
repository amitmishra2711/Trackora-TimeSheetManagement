namespace Trackora.API.DTOs
{
    public class UpdateTeamDto
    {
        public string Name { get; set; } = string.Empty;
        public int LeaderId { get; set; }
    }
}