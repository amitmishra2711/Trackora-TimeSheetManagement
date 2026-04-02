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
            // Unique email
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            // Team → Leader (restrict delete)
            modelBuilder.Entity<Team>()
                .HasOne(t => t.Leader)
                .WithMany(u => u.LeadingTeams)
                .HasForeignKey(t => t.LeaderId)
                .OnDelete(DeleteBehavior.Restrict);

            // TeamMember unique constraint
            modelBuilder.Entity<TeamMember>()
                .HasIndex(tm => new { tm.TeamId, tm.UserId }).IsUnique();

            // ProjectTeam unique constraint
            modelBuilder.Entity<ProjectTeam>()
                .HasIndex(pt => new { pt.ProjectId, pt.TeamId }).IsUnique();

            // Task AssignedTo
            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.AssignedToUser)
                .WithMany()
                .HasForeignKey(t => t.AssignedTo)
                .OnDelete(DeleteBehavior.Restrict);

            // Task AssignedBy
            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.AssignedByUser)
                .WithMany()
                .HasForeignKey(t => t.AssignedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // Timesheet → Task (restrict)
            modelBuilder.Entity<Timesheet>()
.HasOne(t => t.Task)
    .WithMany(t => t.Timesheets)
    .HasForeignKey(t => t.TaskId)
                .OnDelete(DeleteBehavior.Restrict);

            // Timesheet → Project (restrict)
            modelBuilder.Entity<Timesheet>()
                .HasOne(ts => ts.Project)
                .WithMany(p => p.Timesheets)
                .HasForeignKey(ts => ts.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            // DailyReport → Leader (restrict)
            modelBuilder.Entity<DailyReport>()
                .HasOne(r => r.Leader)
                .WithMany()
                .HasForeignKey(r => r.LeaderId)
                .OnDelete(DeleteBehavior.Restrict);

         
         
            
            // Seed Admin user (password: Admin@123)
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