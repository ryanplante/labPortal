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

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<TESTContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var corsOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>();
Console.WriteLine("Allowed CORS Origins:");
foreach (var origin in corsOrigins)
{
    Console.WriteLine(origin);
}
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        corsBuilder => corsBuilder
            .WithOrigins(builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>()) 
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

// Add SignalR service
builder.Services.AddSignalR();

var app = builder.Build();

// Determine the port to use based on environment and command-line arguments
var port = app.Environment.IsDevelopment()
    ? (args.Length > 0 && int.TryParse(args[0], out var parsedPort) && parsedPort >= 49152 && parsedPort <= 65535 ? parsedPort : 7282)
    : (args.Length > 0 && int.TryParse(args[0], out parsedPort) && parsedPort >= 49152 && parsedPort <= 65535 ? parsedPort : 80);


app.UseCors("AllowAllOrigins");
app.MapControllers();

// Map SignalR hubs
app.MapHub<ChatHub>("/chatHub");  // For tutor chat
app.MapHub<NotificationsHub>("/notificationsHub"); // For notifications 
string url = $"http://0.0.0.0:{port}";
// Set up swagger and https for development, http for production
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    Console.WriteLine($"API running on https://0.0.0.0:{port}");
    app.Run(url.Replace("http", "https")); 
}
else
{
    Console.WriteLine($"API running on http://0.0.0.0:{port}");
    app.Run(url);
}

