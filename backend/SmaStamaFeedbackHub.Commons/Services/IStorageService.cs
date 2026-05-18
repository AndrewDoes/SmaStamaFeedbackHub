using Microsoft.AspNetCore.Http;

namespace SmaStamaFeedbackHub.Commons.Services;

public interface IStorageService
{
    /// <summary>
    /// Uploads a file to storage and returns the public URL, final file size, and content type.
    /// </summary>
    Task<(string Url, long Size, string ContentType)> UploadFileAsync(IFormFile file, string folder);
    
    Task DeleteFileAsync(string fileUrl);
}
