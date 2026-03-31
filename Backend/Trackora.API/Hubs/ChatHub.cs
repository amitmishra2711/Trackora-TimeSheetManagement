using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using Trackora.API.DTOs;
using Trackora.API.Services.Interfaces;

namespace Trackora.API.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IMessageService _messageService;

        public ChatHub(IMessageService messageService)
        {
            _messageService = messageService;
        }

        public async System.Threading.Tasks.Task SendDirectMessage(int receiverId, string messageText)
        {
            var senderId = int.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var dto = new SendMessageDto { ReceiverId = receiverId, MessageText = messageText };
            var saved = await _messageService.SaveMessageAsync(dto, senderId);

            // Send to both sender and receiver
            await Clients.User(receiverId.ToString()).SendAsync("ReceiveDirectMessage", saved);
            await Clients.Caller.SendAsync("ReceiveDirectMessage", saved);
        }

        public async System.Threading.Tasks.Task SendTeamMessage(int teamId, string messageText)
        {
            var senderId = int.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var dto = new SendMessageDto { TeamId = teamId, MessageText = messageText };
            var saved = await _messageService.SaveMessageAsync(dto, senderId);

            await Clients.Group($"team_{teamId}").SendAsync("ReceiveTeamMessage", saved);
        }

        public async System.Threading.Tasks.Task JoinTeam(int teamId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"team_{teamId}");
        }

        public async System.Threading.Tasks.Task LeaveTeam(int teamId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"team_{teamId}");
        }
    }
}