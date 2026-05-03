using CsvHelper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Contracts.Requests.Users;
using SmaStamaFeedbackHub.Contracts.Responses.Users;
using SmaStamaFeedbackHub.Entities;
using System.Globalization;

namespace SmaStamaFeedbackHub.Commons.Handlers.Users;

public class BulkImportStudentsCommand : BulkImportStudentsRequest, IRequest<BulkImportResponse>;

public class StudentCsvRecord
{
    public string Code { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int BatchYear { get; set; }
}

public class BulkImportStudentsHandler : IRequestHandler<BulkImportStudentsCommand, BulkImportResponse>
{
    private readonly AppDbContext _context;
    private static readonly Random _random = new();

    public BulkImportStudentsHandler(AppDbContext context)
    {
        _context = context;
    }

    private static string GenerateRandomPrefix(int length = 5)
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[_random.Next(s.Length)]).ToArray());
    }

    public async Task<BulkImportResponse> Handle(BulkImportStudentsCommand request, CancellationToken cancellationToken)
    {
        var result = new BulkImportResponse();

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
