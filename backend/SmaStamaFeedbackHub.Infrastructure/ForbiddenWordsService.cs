using Microsoft.EntityFrameworkCore;
using SmaStamaFeedbackHub.Commons;
using SmaStamaFeedbackHub.Entities;

namespace SmaStamaFeedbackHub.Infrastructure;

public class ForbiddenWordsService : ISafetyFilter
{
    private readonly AppDbContext _context;
    private static HashSet<string>? _cache;
    private static readonly object _lock = new();

    public ForbiddenWordsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task InitializeAsync()
    {
        if (_cache == null)
        {
            var words = await _context.ForbiddenWords.Select(w => w.Word.ToLower()).ToListAsync();
            lock (_lock)
            {
                _cache = new HashSet<string>(words);
            }
        }
    }

    public bool IsContentSafe(string content)
    {
        if (_cache == null) return true; // Or block until initialized

        var words = content.ToLower().Split(new[] { ' ', '.', ',', '!', '?' }, StringSplitOptions.RemoveEmptyEntries);
        return !words.Any(w => _cache.Contains(w));
    }

    public async Task<bool> IsContentSafeAsync(string content)
    {
        await InitializeAsync();
        return IsContentSafe(content);
    }
}
