using Microsoft.EntityFrameworkCore;
using Trackora.API.Models;

namespace Trackora.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Team> Teams => Set<Team>();
        public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
        public DbSet<Project> Projects => Set<Project>();
        public DbSet<ProjectTeam> ProjectTeams => Set<ProjectTeam>();
        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<Timesheet> Timesheets => Set<Timesheet>();
        public DbSet<DailyReport> DailyReports => Set<DailyReport>();
        public DbSet<ReportDetail> ReportDetails => Set<ReportDetail>();
        public DbSet<ExportLog> ExportLogs => Set<ExportLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            modelBuilder.Entity<Team>()
                .HasOne(t => t.Leader)
                .WithMany(u => u.LeadingTeams)
                .HasForeignKey(t => t.LeaderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TeamMember>()
                .HasIndex(tm => new { tm.TeamId, tm.UserId }).IsUnique();

            modelBuilder.Entity<ProjectTeam>()
                .HasIndex(pt => new { pt.ProjectId, pt.TeamId }).IsUnique();

            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.AssignedToUser)
                .WithMany()
                .HasForeignKey(t => t.AssignedTo)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.AssignedByUser)
                .WithMany()
                .HasForeignKey(t => t.AssignedBy)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Timesheet>()
            .HasOne(t => t.Task)
            .WithMany(t => t.Timesheets)
            .HasForeignKey(t => t.TaskId)
            .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Timesheet>()
                .HasOne(ts => ts.Project)
                .WithMany(p => p.Timesheets)
                .HasForeignKey(ts => ts.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DailyReport>()
                .HasOne(r => r.Leader)
                .WithMany()
                .HasForeignKey(r => r.LeaderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 1,
                FirstName = "Super",
                LastName = "Admin",
                Email = "admin@trackora.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = "Admin",
                IsActive = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
    }
}