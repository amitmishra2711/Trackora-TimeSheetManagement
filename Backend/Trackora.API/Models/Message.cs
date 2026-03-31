using System.ComponentModel.DataAnnotations.Schema;

namespace Trackora.API.Models
{
    public class Message
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int? ReceiverId { get; set; }
        public int? TeamId { get; set; }
        public string MessageText { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("SenderId")] public User Sender { get; set; } = null!;
        [ForeignKey("ReceiverId")] public User? Receiver { get; set; }
        [ForeignKey("TeamId")] public Team? Team { get; set; }
    }
}