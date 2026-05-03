using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Entities;
using SmaStamaFeedbackHub.Contracts.Enums;
using Microsoft.Extensions.Hosting;

namespace SmaStamaFeedbackHub.Infrastructure;

public static class DatabaseSeeder
{
    private const int CURRENT_SEED_VERSION = 16;

    public static async Task SeedAsync(AppDbContext context, IHostEnvironment env)
    {
        Console.WriteLine("[Seeder] Starting database seeding process...");
        
        try 
        {
            await context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Seeder] Migration failed: {ex.Message}");
            // Continue anyway, maybe the DB is already set up
        }

        // 1. ALWAYS ensure at least one admin exists (Core Seeding)
        var hasAnyAdmin = await context.Users.AnyAsync(u => u.Role == UserRole.Administrator);
        if (!hasAnyAdmin)
        {
            Console.WriteLine("[Seeder] No administrators found. Seeding initial production admin...");
            var admin = new User
            {
                Id = Guid.NewGuid(),
                Code = "ADMIN001",
                FullName = "Head Administrator",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = UserRole.Administrator,
                IsActive = true,
                MustChangePassword = false
            };
            context.Users.Add(admin);
            await context.SaveChangesAsync();
            Console.WriteLine("[Seeder] Initial admin (ADMIN001) created.");
        }

        // 2. Versioned Seeding for updates and development data
        var versionMeta = await context.SystemMetadata
            .FirstOrDefaultAsync(m => m.Key == "SeedingVersion");

        var currentVersion = versionMeta != null ? int.Parse(versionMeta.Value) : 0;

        if (currentVersion < CURRENT_SEED_VERSION)
        {
            Console.WriteLine($"[Seeder] Upgrading database from v{currentVersion} to v{CURRENT_SEED_VERSION}...");

            // Seed additional admins if needed (e.g. for staff)
            var additionalAdmins = new List<User>
            {
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
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Code = "ADMIN004",
                    FullName = "Admin IT Support",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123!"),
                    Role = UserRole.Administrator,
                    IsActive = true,
                    MustChangePassword = false
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Code = "ADMIN005",
                    FullName = "Admin Management",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123!"),
                    Role = UserRole.Administrator,
                    IsActive = true,
                    MustChangePassword = false
                }
            };

            foreach (var admin in additionalAdmins)
            {
                if (!await context.Users.AnyAsync(u => u.Code == admin.Code))
                {
                    context.Users.Add(admin);
                }
            }
            await context.SaveChangesAsync();

            // Only seed fake students if we are in Development mode
            if (env.IsDevelopment())
            {
                var hasStudents = await context.Users.AnyAsync(u => u.Role == UserRole.Student);
                if (!hasStudents)
                {
                    Console.WriteLine("[Seeder] Seeding 20 Female Students (Development Mode)...");
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

                    context.Users.AddRange(students);
                    await context.SaveChangesAsync();
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
            Console.WriteLine($"[Seeder] Successfully upgraded to v{CURRENT_SEED_VERSION}.");
        }
        else
        {
            Console.WriteLine($"[Seeder] Database is already at version {currentVersion}.");
        }
    }
}
