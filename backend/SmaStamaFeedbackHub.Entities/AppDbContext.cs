using Microsoft.EntityFrameworkCore;

namespace SmaStamaFeedbackHub.Entities;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();
    public DbSet<SystemMetadata> SystemMetadata => Set<SystemMetadata>();
    public DbSet<FeedbackAttachment> Attachments => Set<FeedbackAttachment>();
    public DbSet<FeedbackLog> FeedbackLogs => Set<FeedbackLog>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId);
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Code)
            .IsUnique();

        modelBuilder.Entity<Feedback>()
            .HasOne(f => f.Owner)
            .WithMany(u => u.Feedbacks)
            .HasForeignKey(f => f.OwnerId);

        modelBuilder.Entity<FeedbackLog>()
            .HasOne(l => l.Feedback)
            .WithMany(f => f.Logs)
            .HasForeignKey(l => l.FeedbackId);

        modelBuilder.Entity<FeedbackLog>()
            .HasOne(l => l.Admin)
            .WithMany()
            .HasForeignKey(l => l.AdminId);
    }
}
