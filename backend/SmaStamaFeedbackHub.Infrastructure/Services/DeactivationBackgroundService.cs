using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SmaStamaFeedbackHub.Entities;
using Microsoft.EntityFrameworkCore;

namespace SmaStamaFeedbackHub.Infrastructure.Services;

public class DeactivationBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DeactivationBackgroundService> _logger;

    public DeactivationBackgroundService(IServiceProvider serviceProvider, ILogger<DeactivationBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Deactivation Background Service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Checking for students to deactivate...");

            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    
                    // Logic: Deactivate students who started more than 3 years ago (typical HS duration)
                    // Or we could have a specific 'GraduationYear' field, but we have 'BatchYear'
                    var currentYear = DateTime.UtcNow.Year;
                    var thresholdYear = currentYear - 3; 

                    var studentsToDeactivate = await context.Users
                        .Where(u => u.Role == UserRole.Student && u.IsActive && u.BatchYear < thresholdYear)
                        .ToListAsync(stoppingToken);

                    if (studentsToDeactivate.Any())
                    {
                        foreach (var student in studentsToDeactivate)
                        {
                            student.IsActive = false;
                            _logger.LogInformation("Deactivating student: {Code} ({BatchYear})", student.Code, student.BatchYear);
                        }

                        await context.SaveChangesAsync(stoppingToken);
                        _logger.LogInformation("Successfully deactivated {Count} students.", studentsToDeactivate.Count);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deactivating students.");
            }

            // Run once every 24 hours
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }

        _logger.LogInformation("Deactivation Background Service is stopping.");
    }
}
