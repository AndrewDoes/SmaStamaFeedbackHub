namespace SmaStamaFeedbackHub.Contracts.Responses;

public class FeedbackDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsFlagged { get; set; }

    public FeedbackDto() { }

    public FeedbackDto(Guid id, string title, string content, DateTime createdAt, bool isFlagged)
    {
        Id = id;
        Title = title;
        Content = content;
        CreatedAt = createdAt;
        IsFlagged = isFlagged;
    }
}
