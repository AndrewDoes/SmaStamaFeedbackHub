using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Contracts.Responses.Feedback;
using SmaStamaFeedbackHub.Contracts.Enums;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class GetFeedbackDetailQuery : IRequest<FeedbackDto>
{
    public Guid Id { get; set; }
    public GetFeedbackDetailQuery(Guid id) => Id = id;
}

public class GetFeedbackDetailHandler : IRequestHandler<GetFeedbackDetailQuery, FeedbackDto>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;

    public GetFeedbackDetailHandler(AppDbContext context, IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<FeedbackDto> Handle(GetFeedbackDetailQuery request, CancellationToken cancellationToken)
    {
        var feedback = await _context.Feedbacks
            .Include(f => f.Owner)
            .Include(f => f.Replies)
                .ThenInclude(r => r.Owner)
            .Include(f => f.Attachments)
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

        if (feedback == null) throw new KeyNotFoundException("Feedback not found.");

        // Privacy Logic: Students can only see their own records
        if (_userContext.Role == UserRole.Student && feedback.OwnerId != _userContext.UserId)
        {
            throw new UnauthorizedAccessException("Access Denied: You can only view your own feedback threads.");
        }

        return MapToDto(feedback);
    }

    private FeedbackDto MapToDto(Entities.Feedback item)
    {
        bool isStaff = item.Owner?.Role == UserRole.Administrator;
        bool isOwner = item.OwnerId == _userContext.UserId;
        
        // True Anonymity Logic:
        // Mask the Student Name for everyone EXCEPT the staff.
        string maskedAuthorName = isStaff ? (item.Owner?.FullName ?? "Staff") : "Student Contributor";

        return new FeedbackDto
        {
            Id = item.Id,
            Title = item.Title,
            Content = item.Content,
            CreatedAt = item.CreatedAt,
            IsFlagged = item.IsFlagged,
            Status = item.Status,
            Category = item.Category,
            IsStaffResponse = isStaff,
            IsAuthor = isOwner,
            AuthorName = maskedAuthorName,
            Replies = item.Replies.OrderBy(r => r.CreatedAt).Select(r => MapToDto(r)).ToList(),
            AttachmentUrls = item.Attachments.Select(a => a.BlobUrl).ToList()
        };
    }
}
