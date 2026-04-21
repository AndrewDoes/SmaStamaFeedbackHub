using Microsoft.AspNetCore.Http;

namespace SmaStamaFeedbackHub.Commons.Services;

public interface IStorageService
{
    /// <summary>
    /// Uploads a file to storage and returns the public URL.
    /// </summary>
    Task<string> UploadFileAsync(IFormFile file, string folder);
    
    Task DeleteFileAsync(string fileUrl);
}
