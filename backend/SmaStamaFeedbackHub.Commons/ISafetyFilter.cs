namespace SmaStamaFeedbackHub.Commons;

public interface ISafetyFilter
{
    bool IsContentSafe(string content);
    Task<bool> IsContentSafeAsync(string content);
}
