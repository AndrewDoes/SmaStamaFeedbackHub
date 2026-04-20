using System.ComponentModel.DataAnnotations;

namespace SmaStamaFeedbackHub.Entities;

public class SystemMetadata
{
    [Key]
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
}
