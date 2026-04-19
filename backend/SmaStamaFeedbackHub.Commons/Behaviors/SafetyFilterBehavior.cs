using MediatR;
using SmaStamaFeedbackHub.Contracts;

namespace SmaStamaFeedbackHub.Commons.Behaviors;

public interface ISafeRequest
{
    string Content { get; }
    string Title { get; }
}

public class SafetyFilterBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>, ISafeRequest
{
    private readonly ISafetyFilter _safetyFilter;

    public SafetyFilterBehavior(ISafetyFilter safetyFilter)
    {
        _safetyFilter = safetyFilter;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (!await _safetyFilter.IsContentSafeAsync(request.Title) || 
            !await _safetyFilter.IsContentSafeAsync(request.Content))
        {
            throw new ValidationException("Content contains forbidden words.");
        }

        return await next();
    }
}

public class ValidationException : Exception
{
    public ValidationException(string message) : base(message) { }
}
