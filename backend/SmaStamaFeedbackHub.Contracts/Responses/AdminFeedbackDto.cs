namespace SmaStamaFeedbackHub.Contracts.Responses;

public class AdminFeedbackDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsFlagged { get; set; }
    public string? FlagReason { get; set; }
    public Guid OwnerId { get; set; }
    public string OwnerCode { get; set; } = string.Empty;
    public string OwnerFullName { get; set; } = string.Empty;

    public AdminFeedbackDto() { }

    public AdminFeedbackDto(
        Guid id, 
        string title, 
        string content, 
        DateTime createdAt, 
        bool isFlagged, 
        string? flagReason, 
        Guid ownerId, 
        string ownerCode, 
        string ownerFullName)
    {
        Id = id;
        Title = title;
        Content = content;
        CreatedAt = createdAt;
        IsFlagged = isFlagged;
        FlagReason = flagReason;
        OwnerId = ownerId;
        OwnerCode = ownerCode;
        OwnerFullName = ownerFullName;
    }
}
