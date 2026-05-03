using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Contracts.Requests.Users;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Users;

public class CreateStudentCommand : CreateStudentRequest, IRequest<string>;

public class CreateStudentHandler : IRequestHandler<CreateStudentCommand, string>
{
    private readonly AppDbContext _context;
    private static readonly Random _random = new();

    public CreateStudentHandler(AppDbContext context)
    {
        _context = context;
    }

    private static string GenerateRandomPrefix(int length = 5)
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[_random.Next(s.Length)]).ToArray());
    }

    public async Task<string> Handle(CreateStudentCommand request, CancellationToken cancellationToken)
    {
        var code = request.Code.Trim();
        var existingUser = await _context.Users
            .AnyAsync(u => u.Code == code, cancellationToken);

        if (existingUser)
        {
            throw new InvalidOperationException($"Siswa dengan kode {code} sudah terdaftar.");
        }

        var randomPrefix = GenerateRandomPrefix();
        var initialPassword = $"{randomPrefix}{code}";

        var user = new User
        {
            Id = Guid.NewGuid(),
            Code = code,
            FullName = request.FullName.Trim(),
            BatchYear = request.BatchYear,
            Role = UserRole.Student,
            IsActive = true,
            MustChangePassword = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(initialPassword)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        return initialPassword;
    }
}
