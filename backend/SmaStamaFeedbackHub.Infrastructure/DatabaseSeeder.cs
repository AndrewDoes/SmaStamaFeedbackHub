using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Entities;
using SmaStamaFeedbackHub.Contracts.Enums;

namespace SmaStamaFeedbackHub.Infrastructure;

public static class DatabaseSeeder
{
    private const int CURRENT_SEED_VERSION = 13;

    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        var versionMeta = await context.SystemMetadata
            .FirstOrDefaultAsync(m => m.Key == "SeedingVersion");

        var currentVersion = versionMeta != null ? int.Parse(versionMeta.Value) : 0;

        if (currentVersion < CURRENT_SEED_VERSION)
        {
            Console.WriteLine($"[Seeder] Upgrading database from v{currentVersion} to v{CURRENT_SEED_VERSION}...");
            
            // Wipe existing data
            await context.Notifications.ExecuteDeleteAsync();
            await context.Attachments.ExecuteDeleteAsync();
            await context.FeedbackLogs.ExecuteDeleteAsync();
            await context.Feedbacks.ExecuteDeleteAsync();
            await context.Users.ExecuteDeleteAsync();

            Console.WriteLine("[Seeder] Seeding 3 Admins...");
            var admins = new List<User>
            {
                new User
                {
                    Id = Guid.NewGuid(),
                    Code = "ADMIN001",
                    FullName = "Head Administrator",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = UserRole.Administrator,
                    IsActive = true,
                    MustChangePassword = false
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Code = "ADMIN002",
                    FullName = "Staff Admin Sarah",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = UserRole.Administrator,
                    IsActive = true,
                    MustChangePassword = false
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Code = "ADMIN003",
                    FullName = "Staff Admin Linda",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = UserRole.Administrator,
                    IsActive = true,
                    MustChangePassword = false
                }
            };

            Console.WriteLine("[Seeder] Seeding 20 Female Students...");
            var femaleNames = new[] {
                "Alya Putri", "Bunga Lestari", "Citra Kirana", "Dian Sastrowardoyo", "Eka Wahyuni",
                "Fitri Handayani", "Gita Gutawa", "Hana Pertiwi", "Indah Permatasari", "Juwita Bahar",
                "Kartika Sari", "Lestari Ayu", "Maya Kartika", "Nia Ramadhani", "Olivia Jensen",
                "Putri Marino", "Qory Sandioriva", "Rossa Roslaina", "Siti Nurhaliza", "Tiara Andini"
            };

            var students = femaleNames.Select((name, i) => new User
            {
                Id = Guid.NewGuid(),
                Code = $"202400{i+1:D2}",
                FullName = name,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
                Role = UserRole.Student,
                BatchYear = 2024,
                IsActive = true,
                MustChangePassword = true
            }).ToList();

            context.Users.AddRange(admins);
            context.Users.AddRange(students);
            await context.SaveChangesAsync();

            Console.WriteLine("[Seeder] Skipping feedback threads as requested.");

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
            Console.WriteLine($"[Seeder] Successfully upgraded to v{CURRENT_SEED_VERSION}. 20 Female Students and 3 Admins are ready.");
        }
        else
        {
            Console.WriteLine($"[Seeder] Database is already at version {currentVersion}. Skipping seed.");
        }
    }
}
