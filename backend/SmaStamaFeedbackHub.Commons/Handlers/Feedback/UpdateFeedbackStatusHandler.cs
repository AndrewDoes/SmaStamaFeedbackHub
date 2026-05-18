using MediatR;
using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Commons.Services;
using SmaStamaFeedbackHub.Contracts.Enums;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons.Handlers.Feedback;

public class UpdateFeedbackStatusCommand : IRequest
{
    public Guid Id { get; set; }
    public FeedbackStatus Status { get; set; }
    public string? Resolution { get; set; }
    public bool? IsDenied { get; set; }
}

public class UpdateFeedbackStatusHandler : IRequestHandler<UpdateFeedbackStatusCommand>
{
    private readonly AppDbContext _context;
    private readonly IUserContext _userContext;
    private readonly INotificationService _notificationService;
    private readonly IStorageService _storageService;

    public UpdateFeedbackStatusHandler(AppDbContext context, IUserContext userContext, INotificationService notificationService, IStorageService storageService)
    {
        _context = context;
        _userContext = userContext;
        _notificationService = notificationService;
        _storageService = storageService;
    }

    public async Task Handle(UpdateFeedbackStatusCommand request, CancellationToken cancellationToken)
    {
        // 1. Strict Authorization: Only Administrators can change status
        if (_userContext.Role != UserRole.Administrator)
        {
            throw new UnauthorizedAccessException("Akses Ditolak: Hanya administrator yang dapat memperbarui status umpan balik.");
        }

        var feedback = await _context.Feedbacks
            .Include(f => f.Attachments)
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken);
        if (feedback == null)
        {
            throw new KeyNotFoundException("Catatan umpan balik tidak ditemukan.");
        }

        // 2. Record transition for auditing
        var oldStatus = feedback.Status;
        
        // 3. Apply status change
        feedback.Status = request.Status;

        // 4. Handle Resolution
        if (request.Status == FeedbackStatus.Resolved)
        {
            if (string.IsNullOrWhiteSpace(request.Resolution))
            {
                throw new ArgumentException("Pesan resolusi diperlukan saat menandai umpan balik sebagai selesai.");
            }
            feedback.Resolution = request.Resolution;
            feedback.ResolvedAt = DateTime.UtcNow;
            feedback.IsDenied = request.IsDenied ?? false;

            // --- IMMEDIATE PURGE CLEANUP ---
            if (feedback.Attachments.Any())
            {
                long storageFreed = 0;
                foreach (var att in feedback.Attachments.ToList())
                {
                    await _storageService.DeleteFileAsync(att.BlobUrl);
                    storageFreed += att.FileSize;
                }

                // Delete records from database
                _context.Attachments.RemoveRange(feedback.Attachments);
                feedback.Attachments.Clear();

                // Update server storage quota
                if (storageFreed > 0)
                {
                    var storageMeta = await _context.SystemMetadata.FirstOrDefaultAsync(m => m.Key == "TotalStorageUsed", cancellationToken);
                    if (storageMeta != null && long.TryParse(storageMeta.Value, out var currentStorage))
                    {
                        currentStorage = Math.Max(0, currentStorage - storageFreed);
                        storageMeta.Value = currentStorage.ToString();
                        storageMeta.LastUpdatedAt = DateTime.UtcNow;
                    }
                }
            }
        }

        _context.FeedbackLogs.Add(new FeedbackLog
        {
            Id = Guid.NewGuid(),
            FeedbackId = feedback.Id,
            AdminId = _userContext.UserId,
            Action = "StatusUpdate",
            OldValue = oldStatus.ToString(),
            NewValue = request.Status.ToString(),
            CreatedAt = DateTime.UtcNow
        });
        
        // 5. Notify Student
        if (oldStatus != request.Status)
        {
            string statusText = request.Status switch
            {
                FeedbackStatus.Open => "Aktif",
                FeedbackStatus.InProgress => "Sedang Diproses",
                FeedbackStatus.Resolved => request.IsDenied == true ? "Ditolak" : "Dipenuhi",
                _ => "Diperbarui"
            };

            await _notificationService.SendNotificationAsync(
                feedback.OwnerId,
                $"Umpan Balik {statusText}",
                $"Utas umpan balik Anda '{feedback.Title}' telah dipindahkan ke {statusText}.",
                $"/feedback/{feedback.Id}"
            );
        }
        
        await _context.SaveChangesAsync(cancellationToken);
    }
}
