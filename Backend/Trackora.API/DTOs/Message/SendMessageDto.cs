namespace Trackora.API.DTOs
{
    public class SendMessageDto
    {
        public int? ReceiverId { get; set; }
        public int? TeamId { get; set; }
        public string MessageText { get; set; } = string.Empty;
    }
}