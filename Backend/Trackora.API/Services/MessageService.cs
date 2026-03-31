using Microsoft.EntityFrameworkCore;
using Trackora.API.Data;
using Trackora.API.DTOs;
using Trackora.API.Models;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Services
{
    public class MessageService : IMessageService
    {
        private readonly AppDbContext _db;
        public MessageService(AppDbContext db) => _db = db;

        public async Task<List<MessageDto>> GetDirectMessagesAsync(int userId, int otherId) =>
            (await _db.Messages.Include(m => m.Sender)
                .Where(m => (m.SenderId == userId && m.ReceiverId == otherId) ||
                            (m.SenderId == otherId && m.ReceiverId == userId))
                .OrderBy(m => m.CreatedAt)
                .ToListAsync()).Select(Map).ToList();

        public async Task<List<MessageDto>> GetTeamMessagesAsync(int teamId) =>
            (await _db.Messages.Include(m => m.Sender)
                .Where(m => m.TeamId == teamId)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync()).Select(Map).ToList();

        public async Task<MessageDto> SaveMessageAsync(SendMessageDto dto, int senderId)
        {
            var msg = new Message
            {
                SenderId = senderId,
                ReceiverId = dto.ReceiverId,
                TeamId = dto.TeamId,
                MessageText = dto.MessageText
            };

            _db.Messages.Add(msg);
            await _db.SaveChangesAsync();

            await _db.Entry(msg).Reference(m => m.Sender).LoadAsync();

            return Map(msg);
        }

        private static MessageDto Map(Message m) => new()
        {
            Id = m.Id,
            SenderId = m.SenderId,
            SenderName = $"{m.Sender.FirstName} {m.Sender.LastName}",
            ReceiverId = m.ReceiverId,
            TeamId = m.TeamId,
            MessageText = m.MessageText,
            CreatedAt = m.CreatedAt
        };
    }
}