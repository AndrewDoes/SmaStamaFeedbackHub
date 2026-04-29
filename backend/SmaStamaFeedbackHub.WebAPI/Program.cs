using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmaStamaFeedbackHub.Commons;
using SmaStamaFeedbackHub.Commons.Behaviors;
using SmaStamaFeedbackHub.Commons.Handlers.Auth;
using SmaStamaFeedbackHub.Commons.Handlers.Feedback;
using SmaStamaFeedbackHub.Entities;
using SmaStamaFeedbackHub.Infrastructure;
using SmaStamaFeedbackHub.Infrastructure.Services;
using SmaStamaFeedbackHub.Commons.Services;
using SmaStamaFeedbackHub.WebAPI;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = !string.IsNullOrEmpty(builder.Configuration["Jwt:Issuer"]),
            ValidateAudience = !string.IsNullOrEmpty(builder.Configuration["Jwt:Audience"]),
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "SecretKeyMustBeVeryLongToBeSecure123!"))
        };
    });

builder.Services.AddAuthorization();

// MediatR & Validation
builder.Services.AddValidatorsFromAssembly(typeof(IJwtService).Assembly);
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(GetFeedbackListQuery).Assembly);
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
});

// DI
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContext, UserContext>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IStorageService, AzureBlobStorageService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddHostedService<DeactivationBackgroundService>();

var app = builder.Build();

// Seed Database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try 
    {
        await DatabaseSeeder.SeedAsync(context, app.Environment);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[CRITICAL] Database Seeding Failed: {ex.Message}");
        Console.WriteLine(ex.StackTrace);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
