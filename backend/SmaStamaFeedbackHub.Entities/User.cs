using System.ComponentModel.DataAnnotations;

namespace SmaStamaFeedbackHub.Entities;

public enum UserRole
{
    Student,
    Administrator
}

public class User
{
    public Guid Id { get; set; }
    
    [Required]
    public string Code { get; set; } = string.Empty;
    
    [Required]
    public string FullName { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    public UserRole Role { get; set; }
    
    public int BatchYear { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public List<Feedback> Feedbacks { get; set; } = new();
}
