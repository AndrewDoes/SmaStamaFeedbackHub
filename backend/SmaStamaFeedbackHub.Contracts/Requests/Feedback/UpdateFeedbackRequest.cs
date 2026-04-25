namespace SmaStamaFeedbackHub.Contracts.Requests.Feedback;
using SmaStamaFeedbackHub.Contracts.Enums;

public class UpdateFeedbackRequest
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public FeedbackCategory Category { get; set; }
    public List<Guid>? AttachmentIdsToDelete { get; set; }
}
