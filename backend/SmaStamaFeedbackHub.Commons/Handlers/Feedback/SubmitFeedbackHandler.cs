using MediatR;
using SmaStamaFeedbackHub.Commons.Behaviors;
using SmaStamaFeedbackHub.Contracts.Requests.Feedback;
using SmaStamaFeedbackHub.Entities;

using Microsoft.AspNetCore.Http;
using SmaStamaFeedbackHub.Commons.Services;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class SubmitFeedbackCommand : CreateFeedbackRequest, IRequest<Guid>, ISafeRequest
{
    public List<IFormFile>? Proofs { get; set; }
}

public class SubmitFeedbackHandler : IRequestHandler<SubmitFeedbackCommand, Guid>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;
    private readonly IStorageService _storageService;

    public SubmitFeedbackHandler(AppDbContext context, IUserContext userContext, IStorageService storageService)
    {
        _context = context;
        _userContext = userContext;
        _storageService = storageService;
    }

    public async Task<Guid> Handle(SubmitFeedbackCommand request, CancellationToken cancellationToken)
    {
        var feedback = new Entities.Feedback
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow,
            OwnerId = _userContext.UserId,
            IsFlagged = false
        };

        // Handle Proofs / Attachments
        if (request.Proofs != null && request.Proofs.Any())
        {
            foreach (var file in request.Proofs)
            {
                var url = await _storageService.UploadFileAsync(file, "proofs");
                feedback.Attachments.Add(new FeedbackAttachment
                {
                    Id = Guid.NewGuid(),
                    FileName = file.FileName,
                    BlobUrl = url,
                    FeedbackId = feedback.Id
                });
            }
        }

        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync(cancellationToken);

        return feedback.Id;
    }
}
