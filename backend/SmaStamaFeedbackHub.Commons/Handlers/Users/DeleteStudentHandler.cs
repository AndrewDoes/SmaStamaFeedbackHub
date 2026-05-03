using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Contracts.Requests.Users;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Users;

public class DeleteStudentCommand : DeleteStudentRequest, IRequest;

public class DeleteStudentHandler : IRequestHandler<DeleteStudentCommand>
{
    private readonly AppDbContext _context;

    public DeleteStudentHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteStudentCommand request, CancellationToken cancellationToken)
    {
        var student = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.Id && u.Role == UserRole.Student, cancellationToken);

        if (student == null)
        {
            throw new KeyNotFoundException("Siswa tidak ditemukan.");
        }

        // Delete related data if necessary, but here we just delete the user
        // Note: In a real system, you might want to soft-delete or check for dependencies (like feedbacks)
        
        var hasFeedbacks = await _context.Feedbacks.AnyAsync(f => f.OwnerId == request.Id, cancellationToken);
        if (hasFeedbacks)
        {
            // If they have feedbacks, maybe just deactivate them instead of hard delete
            // Or delete the feedbacks too? User requested "remove student", usually implies deletion.
            // Let's go with deletion of the user, feedbacks will be orphaned if not handled.
            // In this DB, feedbacks have a FK to OwnerId.
            var feedbacks = await _context.Feedbacks.Where(f => f.OwnerId == request.Id).ToListAsync(cancellationToken);
            _context.Feedbacks.RemoveRange(feedbacks);
        }

        _context.Users.Remove(student);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
