using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Users;

public class CreateStudentCommand : IRequest<string>
{
    public string Code { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int BatchYear { get; set; }
}

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
        var existingUser = await _context.Users
            .AnyAsync(u => u.Code == request.Code, cancellationToken);

        if (existingUser)
        {
            throw new Exception($"Siswa dengan kode {request.Code} sudah terdaftar.");
        }

        var randomPrefix = GenerateRandomPrefix();
        var initialPassword = $"{randomPrefix}{request.Code.Trim()}";

        var user = new User
        {
            Id = Guid.NewGuid(),
            Code = request.Code.Trim(),
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
