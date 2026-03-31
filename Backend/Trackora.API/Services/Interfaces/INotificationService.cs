using Trackora.API.DTOs;

namespace Trackora.API.Services.Interfaces
{
    public interface INotificationService
    {
        Task<List<NotificationDto>> GetUserNotificationsAsync(int userId);
        Task MarkReadAsync(int id, int userId);
        Task MarkAllReadAsync(int userId);
        Task CreateAsync(int userId, string message);
    }
}