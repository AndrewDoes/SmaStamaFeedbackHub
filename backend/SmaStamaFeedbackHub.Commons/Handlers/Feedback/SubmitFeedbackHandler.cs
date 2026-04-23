using MediatR;
using SmaStamaFeedbackHub.Commons.Behaviors;
using SmaStamaFeedbackHub.Contracts.Requests.Feedback;
using SmaStamaFeedbackHub.Entities;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Commons.Services;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class SubmitFeedbackCommand : CreateFeedbackRequest, IRequest<Guid>
{
    public List<IFormFile>? Proofs { get; set; }
}

public class SubmitFeedbackHandler : IRequestHandler<SubmitFeedbackCommand, Guid>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;
    private readonly IStorageService _storageService;

    private const int MAX_FILES = 5;
    private const long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private readonly string[] ALLOWED_TYPES = { "image/jpeg", "image/png", "image/jpg", "application/pdf" };
    private const int DAILY_LIMIT = 5;

    public SubmitFeedbackHandler(AppDbContext context, IUserContext userContext, IStorageService storageService)
    {
        _context = context;
        _userContext = userContext;
        _storageService = storageService;
    }

    public async Task<Guid> Handle(SubmitFeedbackCommand request, CancellationToken cancellationToken)
    {
        // 1. Rate Limiting / Daily Quota
        var today = DateTime.UtcNow.Date;
        var todayCount = await _context.Feedbacks
            .CountAsync(f => f.OwnerId == _userContext.UserId && f.CreatedAt >= today && f.ParentId == null, cancellationToken);

        if (todayCount >= DAILY_LIMIT)
        {
            throw new InvalidOperationException($"Daily feedback limit reached ({DAILY_LIMIT}). Please try again tomorrow.");
        }

        // 2. Validate Proofs
        if (request.Proofs != null)
        {
            if (request.Proofs.Count > MAX_FILES)
                throw new InvalidOperationException($"Maximum {MAX_FILES} attachments allowed.");

            foreach (var file in request.Proofs)
            {
                if (file.Length > MAX_FILE_SIZE)
                    throw new InvalidOperationException($"File '{file.FileName}' exceeds the 10MB size limit.");

                if (!ALLOWED_TYPES.Contains(file.ContentType.ToLower()))
                    throw new InvalidOperationException($"File '{file.FileName}' has an unsupported format. Only JPG, PNG, and PDF are allowed.");
            }
        }

        var feedback = new Entities.Feedback
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow,
            OwnerId = _userContext.UserId,
            IsFlagged = false,
            Category = request.Category
        };

        // 3. Handle Proofs / Attachments
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
