using System.ComponentModel.DataAnnotations.Schema;

namespace Trackora.API.Models
{
    public class ProjectTeam
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int TeamId { get; set; }

        [ForeignKey("ProjectId")] public Project Project { get; set; } = null!;
        [ForeignKey("TeamId")] public Team Team { get; set; } = null!;
    }
}