using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Commons;

public interface IJwtService
{
    string GenerateToken(User user);
}
