namespace Trackora.API.DTOs
{
    public class TeamDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int LeaderId { get; set; }
        public string LeaderName { get; set; } = string.Empty;
        public List<UserDto> Members { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }
}