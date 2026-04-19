using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons;

public interface IUserContext
{
    Guid UserId { get; }
    UserRole Role { get; }
    string Code { get; }
}
