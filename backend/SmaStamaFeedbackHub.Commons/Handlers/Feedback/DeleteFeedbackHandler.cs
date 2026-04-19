using MediatR;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class DeleteFeedbackCommand : IRequest<bool>
{
    public Guid Id { get; set; }
    public DeleteFeedbackCommand(Guid id) => Id = id;
}

public class DeleteFeedbackHandler : IRequestHandler<DeleteFeedbackCommand, bool>
{
    private readonly AppDbContext _context;

    public DeleteFeedbackHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteFeedbackCommand request, CancellationToken cancellationToken)
    {
        var feedback = await _context.Feedbacks.FindAsync(request.Id);
        if (feedback == null) throw new KeyNotFoundException("Feedback not found.");

        _context.Feedbacks.Remove(feedback);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
