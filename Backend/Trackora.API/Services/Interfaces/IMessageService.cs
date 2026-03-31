using Trackora.API.DTOs;

namespace Trackora.API.Services.Interfaces
{
    public interface IMessageService
    {
        Task<List<MessageDto>> GetDirectMessagesAsync(int userId, int otherId);
        Task<List<MessageDto>> GetTeamMessagesAsync(int teamId);
        Task<MessageDto> SaveMessageAsync(SendMessageDto dto, int senderId);
    }
}