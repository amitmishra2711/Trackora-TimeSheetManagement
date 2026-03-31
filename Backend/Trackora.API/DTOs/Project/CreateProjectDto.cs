namespace Trackora.API.DTOs
{
    public class CreateProjectDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<int> TeamIds { get; set; } = new();
    }
}