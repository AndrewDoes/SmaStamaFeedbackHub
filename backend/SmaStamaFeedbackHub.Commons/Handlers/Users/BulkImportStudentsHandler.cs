using CsvHelper;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Entities;
using System.Globalization;

namespace SmaStamaFeedbackHub.Commons.Handlers.Users;

public class ImportedStudentDetail
{
    public string Code { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string InitialPassword { get; set; } = string.Empty;
}

public class BulkImportResult
{
    public int ImportedCount { get; set; }
    public int SkippedCount { get; set; }
    public List<ImportedStudentDetail> ImportedStudents { get; set; } = new();
    public List<string> Errors { get; set; } = new();
}

public class BulkImportStudentsCommand : IRequest<BulkImportResult>
{
    public IFormFile File { get; set; } = null!;
}

public class StudentCsvRecord
{
    public string Code { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int BatchYear { get; set; }
}

public class BulkImportStudentsHandler : IRequestHandler<BulkImportStudentsCommand, BulkImportResult>
{
    private readonly AppDbContext _context;
    private static readonly Random _random = new();

    public BulkImportStudentsHandler(AppDbContext context)
    {
        _context = context;
    }

    private static string GenerateRandomPrefix(int length = 5)
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"; // Removed ambiguous chars like O, 0, I, l
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[_random.Next(s.Length)]).ToArray());
    }

    public async Task<BulkImportResult> Handle(BulkImportStudentsCommand request, CancellationToken cancellationToken)
    {
        var result = new BulkImportResult();

        if (request.File == null || request.File.Length == 0)
        {
            result.Errors.Add("File is empty or not provided.");
            return result;
        }

        try 
        {
            using var reader = new StreamReader(request.File.OpenReadStream());
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

            var records = csv.GetRecords<StudentCsvRecord>().ToList();

            var existingCodes = await _context.Users
                .Select(u => u.Code)
                .ToListAsync(cancellationToken);

            var newUsers = new List<User>();

            foreach (var record in records)
            {
                var code = record.Code?.Trim();
                var fullName = record.FullName?.Trim();

                if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(fullName))
                {
                    result.Errors.Add($"Skipping row with missing data: Code={code}, Name={fullName}");
                    result.SkippedCount++;
                    continue;
                }

                if (existingCodes.Contains(code))
                {
                    result.SkippedCount++;
                    continue;
                }

                var randomPrefix = GenerateRandomPrefix();
                var initialPassword = $"{randomPrefix}{code}";

                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Code = code,
                    FullName = fullName,
                    BatchYear = record.BatchYear,
                    Role = UserRole.Student,
                    IsActive = true,
                    MustChangePassword = true,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(initialPassword)
                };

                newUsers.Add(user);
                existingCodes.Add(code);
                
                result.ImportedStudents.Add(new ImportedStudentDetail 
                { 
                    Code = code, 
                    FullName = fullName, 
                    InitialPassword = initialPassword 
                });
            }

            if (newUsers.Any())
            {
                _context.Users.AddRange(newUsers);
                await _context.SaveChangesAsync(cancellationToken);
                result.ImportedCount = newUsers.Count;
            }
        }
        catch (Exception ex)
        {
            result.Errors.Add($"Failed to parse CSV: {ex.Message}");
        }

        return result;
    }
}
