using Microsoft.AspNetCore.Http;

namespace SmaStamaFeedbackHub.Contracts.Requests.Users;

public class BulkImportStudentsRequest
{
    public IFormFile File { get; set; } = null!;
}
