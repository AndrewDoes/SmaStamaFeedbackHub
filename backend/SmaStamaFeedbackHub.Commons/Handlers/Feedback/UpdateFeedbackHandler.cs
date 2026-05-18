using MediatR;
using SmaStamaFeedbackHub.Commons.Services;
using SmaStamaFeedbackHub.Contracts.Enums;
using SmaStamaFeedbackHub.Contracts.Requests.Feedback;
using SmaStamaFeedbackHub.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class UpdateFeedbackCommand : UpdateFeedbackRequest, IRequest<bool>
{
    public List<IFormFile>? Proofs { get; set; }
}

public class UpdateFeedbackHandler : IRequestHandler<UpdateFeedbackCommand, bool>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;
    private readonly IStorageService _storageService;

    public UpdateFeedbackHandler(AppDbContext context, IUserContext userContext, IStorageService storageService)
    {
        _context = context;
        _userContext = userContext;
        _storageService = storageService;
    }

    public async Task<bool> Handle(UpdateFeedbackCommand request, CancellationToken cancellationToken)
    {
        var feedback = await _context.Feedbacks
            .Include(f => f.Attachments)
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);

        if (feedback == null) throw new KeyNotFoundException("Feedback not found.");

        // 1. Authorization Check: Must be the owner
        if (feedback.OwnerId != _userContext.UserId)
            throw new UnauthorizedAccessException("You can only edit your own feedback.");

        // 2. Workflow Check: Must be in Open status
        if (feedback.Status != FeedbackStatus.Open)
            throw new InvalidOperationException("This thread is already being processed and cannot be edited.");

        // 3. Delete requested attachments
        long storageChange = 0;

        if (request.AttachmentIdsToDelete != null && request.AttachmentIdsToDelete.Any())
        {
            var toDelete = feedback.Attachments.Where(a => request.AttachmentIdsToDelete.Contains(a.Id)).ToList();
            foreach (var att in toDelete)
            {
                await _storageService.DeleteFileAsync(att.BlobUrl);
                storageChange -= att.FileSize;
                _context.Attachments.Remove(att);
            }
        }

        // 4. Upload new proofs
        if (request.Proofs != null && request.Proofs.Any())
        {
            foreach (var file in request.Proofs)
            {
                var uploadResult = await _storageService.UploadFileAsync(file, "proofs");
                feedback.Attachments.Add(new FeedbackAttachment
                {
                    Id = Guid.NewGuid(),
                    FileName = file.FileName,
                    BlobUrl = uploadResult.Url,
                    FileSize = uploadResult.Size,
                    ContentType = uploadResult.ContentType,
                    FeedbackId = feedback.Id
                });
                storageChange += uploadResult.Size;
            }
        }

        // Apply Storage Quota Delta
        if (storageChange != 0)
        {
            var storageMeta = await _context.SystemMetadata.FirstOrDefaultAsync(m => m.Key == "TotalStorageUsed", cancellationToken);
            long currentStorage = 0;
            if (storageMeta != null && long.TryParse(storageMeta.Value, out var parsedStorage))
            {
                currentStorage = parsedStorage;
            }

            currentStorage = Math.Max(0, currentStorage + storageChange);

            if (storageMeta == null)
            {
                _context.SystemMetadata.Add(new SystemMetadata { Key = "TotalStorageUsed", Value = currentStorage.ToString() });
            }
            else
            {
                storageMeta.Value = currentStorage.ToString();
                storageMeta.LastUpdatedAt = DateTime.UtcNow;
            }
        }

        // 5. Update fields
        feedback.Title = request.Title;
        feedback.Content = request.Content;
        feedback.Category = request.Category;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
