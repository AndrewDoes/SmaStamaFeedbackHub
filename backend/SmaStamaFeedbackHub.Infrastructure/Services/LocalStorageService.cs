using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Webp;
using SmaStamaFeedbackHub.Commons.Services;

namespace SmaStamaFeedbackHub.Infrastructure.Services;

public class LocalStorageService : IStorageService
{
    private readonly IHostEnvironment _env;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly string _uploadDirectory;

    public LocalStorageService(IHostEnvironment env, IHttpContextAccessor httpContextAccessor)
    {
        _env = env;
        _httpContextAccessor = httpContextAccessor;
        
        // Ensure wwwroot/uploads exists
        _uploadDirectory = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
        if (!Directory.Exists(_uploadDirectory))
        {
            Directory.CreateDirectory(_uploadDirectory);
        }
    }

    public async Task<(string Url, long Size, string ContentType)> UploadFileAsync(IFormFile file, string folder)
    {
        // Ensure subfolder exists
        var targetFolder = Path.Combine(_uploadDirectory, folder);
        if (!Directory.Exists(targetFolder))
        {
            Directory.CreateDirectory(targetFolder);
        }

        var isImage = file.ContentType.StartsWith("image/");
        var fileName = $"{Guid.NewGuid()}_{Path.GetFileNameWithoutExtension(file.FileName)}";
        var finalPath = "";
        long finalSize = 0;
        string finalContentType = "";

        if (isImage)
        {
            fileName += ".webp";
            finalPath = Path.Combine(targetFolder, fileName);
            
            using var inputStream = file.OpenReadStream();
            using var image = await Image.LoadAsync(inputStream);
            
            // Resize if too large (e.g., max 1200px width)
            if (image.Width > 1200)
            {
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(1200, 0),
                    Mode = ResizeMode.Max
                }));
            }

            using var outputStream = new FileStream(finalPath, FileMode.Create);
            await image.SaveAsWebpAsync(outputStream, new WebpEncoder { Quality = 75 });
            finalSize = outputStream.Length;
            finalContentType = "image/webp";
        }
        else
        {
            fileName += Path.GetExtension(file.FileName);
            finalPath = Path.Combine(targetFolder, fileName);
            
            using var stream = new FileStream(finalPath, FileMode.Create);
            await file.CopyToAsync(stream);
            finalSize = stream.Length;
            finalContentType = file.ContentType;
        }

        // Generate the Public URL
        var fileUrl = $"/uploads/{folder}/{fileName}";

        return (fileUrl, finalSize, finalContentType);
    }

    public Task DeleteFileAsync(string fileUrl)
    {
        try
        {
            var uri = new Uri(fileUrl);
            var localPath = uri.LocalPath; // e.g., /uploads/proofs/file.webp
            
            // Strip the leading slash to combine correctly
            if (localPath.StartsWith("/"))
            {
                localPath = localPath.Substring(1);
            }

            var fullPath = Path.Combine(_env.ContentRootPath, "wwwroot", localPath);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error deleting local file: {ex.Message}");
        }

        return Task.CompletedTask;
    }
}
