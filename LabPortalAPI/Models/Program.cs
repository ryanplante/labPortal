using LabPortal.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<TESTContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder
            .WithOrigins("http://localhost:8082") // Allow React Native app's origin
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});


var app = builder.Build();

// Determine the port based on the environment
var port = app.Environment.IsDevelopment()
    ? (args.Length > 0 && int.TryParse(args[0], out var parsedPort) && parsedPort >= 49152 && parsedPort <= 65535 ? parsedPort : 5000)
    : (args.Length > 0 && int.TryParse(args[0], out parsedPort) && parsedPort >= 49152 && parsedPort <= 65535 ? parsedPort : 80);



app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.UseCors("AllowSpecificOrigin");


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Use the specified port in development mode
    app.Run();
}
else
{
    // Use the specified port in production mode
    app.Run($"http://0.0.0.0:{port}");
}
