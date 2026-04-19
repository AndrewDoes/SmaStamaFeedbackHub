using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Infrastructure;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        if (!await context.Users.AnyAsync())
        {
            var admin = new User
            {
                Id = Guid.NewGuid(),
                Code = "ADMIN001",
                FullName = "System Administrator",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = UserRole.Administrator,
                IsActive = true
            };

            var student = new User
            {
                Id = Guid.NewGuid(),
                Code = "2023001",
                FullName = "John Student",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
                Role = UserRole.Student,
                BatchYear = 2023,
                IsActive = true
            };

            context.Users.AddRange(admin, student);
        }

        if (!await context.ForbiddenWords.AnyAsync())
        {
            var forbiddenWords = new List<ForbiddenWord>
            {
                new() { Word = "spam" },
                new() { Word = "offensive" },
                new() { Word = "badword" }
            };
            context.ForbiddenWords.AddRange(forbiddenWords);
        }

        await context.SaveChangesAsync();
    }
}
