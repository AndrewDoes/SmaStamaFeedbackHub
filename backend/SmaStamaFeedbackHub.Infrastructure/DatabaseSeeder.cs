using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Entities;
using SmaStamaFeedbackHub.Contracts.Enums;

namespace SmaStamaFeedbackHub.Infrastructure;

public static class DatabaseSeeder
{
    private const int CURRENT_SEED_VERSION = 12;

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
            var admins = Enumerable.Range(1, 3).Select(i => new User
            {
                Id = Guid.NewGuid(),
                Code = $"ADMIN00{i}",
                FullName = i == 1 ? "Head Administrator" : $"Staff Admin {i}",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = UserRole.Administrator,
                IsActive = true,
                MustChangePassword = i == 1
            }).ToList();

            Console.WriteLine("[Seeder] Seeding 10 Students...");
            var students = Enumerable.Range(1, 10).Select(i => new User
            {
                Id = Guid.NewGuid(),
                Code = $"202400{i:D2}",
                FullName = i == 1 ? "John Doe" : i == 2 ? "Jane Smith" : $"Student User {i}",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
                Role = UserRole.Student,
                BatchYear = 2024,
                IsActive = true,
                MustChangePassword = true
            }).ToList();

            context.Users.AddRange(admins);
            context.Users.AddRange(students);
            await context.SaveChangesAsync();

            Console.WriteLine("[Seeder] Seeding feedback threads...");
            var feedbackTitles = new[] { 
                "Library wifi is extremely slow during exams", 
                "More variety needed in the school cafeteria", 
                "Basketball court hoop needs immediate repair", 
                "Request for new literature books (2024 editions)", 
                "Chemistry lab safety equipment inspection", 
                "Additional student parking spaces near Block C",
                "Late night study room access request", 
                "Malfunctioning water fountain in the main hall", 
                "More trash cans needed in the school yard",
                "Inquiry about student council election dates", 
                "Lost and Found department accessibility"
            };

            var random = new Random();
            foreach(var student in students)
            {
                // Most students (9 out of 10) have at least 1 feedback
                if (student.Code != "20240010") 
                {
                    int count = random.Next(1, 3); // 1 or 2 feedbacks per student
                    for(int j = 0; j < count; j++)
                    {
                        context.Feedbacks.Add(new Feedback
                        {
                            Id = Guid.NewGuid(),
                            Title = feedbackTitles[random.Next(feedbackTitles.Length)],
                            Content = "This is a detailed feedback report for administrative review. Please address this issue as soon as possible.",
                            CreatedAt = DateTime.UtcNow.AddDays(-random.Next(1, 14)), // Within last 2 weeks
                            OwnerId = student.Id,
                            Status = (FeedbackStatus)random.Next(0, 2), // Randomly Open (0) or InProgress (1)
                            Category = (FeedbackCategory)random.Next(0, 6), // Randomize between all 6 categories
                            IsFlagged = false
                        });
                    }
                }
            }

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
            Console.WriteLine($"[Seeder] Successfully upgraded to v{CURRENT_SEED_VERSION}. 10 Students and 3 Admins are ready.");
        }
        else
        {
            Console.WriteLine($"[Seeder] Database is already at version {currentVersion}. Skipping seed.");
        }
    }
}
