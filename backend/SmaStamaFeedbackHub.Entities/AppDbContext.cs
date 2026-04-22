using Microsoft.EntityFrameworkCore;

namespace SmaStamaFeedbackHub.Entities;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();
    public DbSet<ForbiddenWord> ForbiddenWords => Set<ForbiddenWord>();
    public DbSet<SystemMetadata> SystemMetadata => Set<SystemMetadata>();
    public DbSet<FeedbackAttachment> Attachments => Set<FeedbackAttachment>();
    public DbSet<FeedbackLog> FeedbackLogs => Set<FeedbackLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
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
