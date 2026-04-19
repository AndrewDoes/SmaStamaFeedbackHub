using System.ComponentModel.DataAnnotations;

namespace SmaStamaFeedbackHub.Entities;

public class ForbiddenWord
{
    [Key]
    public string Word { get; set; } = string.Empty;
}
