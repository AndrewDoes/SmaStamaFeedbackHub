using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Webp;
using SmaStamaFeedbackHub.Commons.Services;

namespace SmaStamaFeedbackHub.Infrastructure.Services;

public class AzureBlobStorageService : IStorageService
{
    private readonly string _connectionString;
    private readonly string _containerName;

    public AzureBlobStorageService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("AzureBlobStorage") 
            ?? ""; // Will handle missing string in the method to allow app to start
        _containerName = configuration["AzureStorage:ContainerName"] ?? "proof-attachments";
    }

    private void EnsureConfigured()
    {
        if (string.IsNullOrEmpty(_connectionString))
        {
            throw new InvalidOperationException("Azure Storage is not configured. Please add 'AzureBlobStorage' connection string to your configuration.");
        }
    }

    public async Task<string> UploadFileAsync(IFormFile file, string folder)
    {
        EnsureConfigured();

        var containerClient = new BlobContainerClient(_connectionString, _containerName);
        
        try
        {
            // Try to create with Public access (for image viewing)
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);
        }
        catch (Azure.RequestFailedException ex) when (ex.ErrorCode == "PublicAccessNotPermitted")
        {
            // Fallback: Create with Private access if account policy blocks public access
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
        }

        var isImage = file.ContentType.StartsWith("image/");
        var fileName = $"{folder}/{Guid.NewGuid()}_{Path.GetFileNameWithoutExtension(file.FileName)}";
        
        if (isImage)
        {
            fileName += ".webp";
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

            using var outputStream = new MemoryStream();
            await image.SaveAsWebpAsync(outputStream, new WebpEncoder { Quality = 75 });
            outputStream.Position = 0;

            var blobClient = containerClient.GetBlobClient(fileName);
            await blobClient.UploadAsync(outputStream, new BlobHttpHeaders { ContentType = "image/webp" });
            return blobClient.Uri.ToString();
        }
        else
        {
            fileName += Path.GetExtension(file.FileName);
            var blobClient = containerClient.GetBlobClient(fileName);
            using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });
            return blobClient.Uri.ToString();
        }
    }

    public async Task DeleteFileAsync(string fileUrl)
    {
        EnsureConfigured();

        try
        {
            var uri = new Uri(fileUrl);
            // Segments are usually ["/", "container/", "folder/blob"]
            // We want everything after the container segment
            var blobPath = string.Join("", uri.Segments.Skip(2));
            blobPath = Uri.UnescapeDataString(blobPath);

            var containerClient = new BlobContainerClient(_connectionString, _containerName);
            var blobClient = containerClient.GetBlobClient(blobPath);
            
            await blobClient.DeleteIfExistsAsync();
        }
        catch (Exception ex)
        {
            // Logging would go here
            Console.WriteLine($"Error deleting blob: {ex.Message}");
        }
    }
}
