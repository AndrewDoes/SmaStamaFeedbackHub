using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Infrastructure;

public static class DatabaseSeeder
{
    private const int CURRENT_SEED_VERSION = 10;

    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        var versionMeta = await context.SystemMetadata
            .FirstOrDefaultAsync(m => m.Key == "SeedingVersion");

        var currentVersion = versionMeta != null ? int.Parse(versionMeta.Value) : 0;

        if (currentVersion < CURRENT_SEED_VERSION)
        {
            Console.WriteLine($"[Seeder] Upgrading database from v{currentVersion} to v{CURRENT_SEED_VERSION}...");
            
            // Wipe existing data (Order matters for constraints)
            Console.WriteLine("[Seeder] Wiping old data...");
            await context.Attachments.ExecuteDeleteAsync();
            await context.FeedbackLogs.ExecuteDeleteAsync();
            await context.Feedbacks.ExecuteDeleteAsync();
            await context.Users.ExecuteDeleteAsync();

            Console.WriteLine("[Seeder] Seeding users...");
            var admin = new User
            {
                Id = Guid.Parse("A0000000-0000-0000-0000-000000000001"),
                Code = "ADMIN001",
                FullName = "System Administrator",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = UserRole.Administrator,
                IsActive = true,
                MustChangePassword = true
            };

            var student1 = new User
            {
                Id = Guid.Parse("B0000000-0000-0000-0000-000000000001"),
                Code = "2023001",
                FullName = "John Doe",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
                Role = UserRole.Student,
                BatchYear = 2023,
                IsActive = true,
                MustChangePassword = true
            };

            var student2 = new User
            {
                Id = Guid.Parse("B0000000-0000-0000-0000-000000000002"),
                Code = "2023002",
                FullName = "Jane Smith",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
                Role = UserRole.Student,
                BatchYear = 2023,
                IsActive = true,
                MustChangePassword = true
            };

            var oldStudent = new User
            {
                Id = Guid.Parse("B0000000-0000-0000-0000-000000000003"),
                Code = "2020001",
                FullName = "Graduated Student",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
                Role = UserRole.Student,
                BatchYear = 2020,
                IsActive = true,
                MustChangePassword = true
            };

            context.Users.AddRange(admin, student1, student2, oldStudent);
            await context.SaveChangesAsync();

            // Seed Feedbacks using the new FIXED ids
            var feedback1 = new Feedback
            {
                Id = Guid.NewGuid(),
                Title = "Library Needs New Books",
                Content = "The science section is outdated. We need 2024 editions.",
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                OwnerId = student1.Id,
                IsFlagged = false
            };

            var feedback2 = new Feedback
            {
                Id = Guid.NewGuid(),
                Title = "Cafeteria Prices",
                Content = "Prices have increased by 20% this semester. It's too much for students.",
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                OwnerId = student2.Id,
                IsFlagged = false
            };

            context.Feedbacks.AddRange(feedback1, feedback2);

            // Update Version
            // Update Version
            if (versionMeta == null)
            {
                context.SystemMetadata.Add(new SystemMetadata { Key = "SeedingVersion", Value = CURRENT_SEED_VERSION.ToString() });
            }
            else
            {
                versionMeta.Value = CURRENT_SEED_VERSION.ToString();
                versionMeta.LastUpdatedAt = DateTime.UtcNow;
                context.SystemMetadata.Update(versionMeta);
            }

            await context.SaveChangesAsync();
            Console.WriteLine($"[Seeder] Successfully upgraded to v{CURRENT_SEED_VERSION}. John Doe (2023001) is ready.");
        }
        else
        {
            Console.WriteLine($"[Seeder] Database is already at version {currentVersion}. Skipping seed.");
        }
    }
}
