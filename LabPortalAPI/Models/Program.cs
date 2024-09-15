using LabPortal.Models;
using LabPortal.Hubs;  // Import your ChatHub
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Register lifetime service to get uptime.
builder.Services.AddSingleton<ApplicationLifetimeService>();

// Configure controllers and JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Enable Swagger for API documentation in development
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure DbContext to use SQL Server
builder.Services.AddDbContext<TESTContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS configuration
var corsOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        corsBuilder => corsBuilder
            .WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

// Add SignalR service
builder.Services.AddSignalR();

var app = builder.Build();

// Enable CORS
app.UseCors("AllowAllOrigins");

// Map SignalR hubs
app.MapHub<ChatHub>("/chatHub");
app.MapHub<NotificationsHub>("/notificationsHub");

// Map Controllers
app.MapControllers();

// Configure environment-specific settings

// Development Environment (Kestrel)
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.UseSwagger();
    app.UseSwaggerUI();
    Console.WriteLine($"API running in development on https://localhost:7282");
    app.Run("https://localhost:7282");  // Run Kestrel on port 7282
}
else
{
    // Production Environment (IIS Integration)
    app.UseHttpsRedirection();
    Console.WriteLine("API running behind IIS.");
    app.Run();  // No need to specify port, let IIS handle the port binding
}
