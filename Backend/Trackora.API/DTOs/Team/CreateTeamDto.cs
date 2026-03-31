namespace Trackora.API.DTOs
{
    public class CreateTeamDto
    {
        public string Name { get; set; } = string.Empty;
        public int LeaderId { get; set; }
        public List<int> MemberIds { get; set; } = new();
    }
}