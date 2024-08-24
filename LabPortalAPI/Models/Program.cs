using LabPortal.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Register lifetime service to get uptime.
builder.Services.AddSingleton<ApplicationLifetimeService>();

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
    options.AddPolicy("AllowAllOrigins",
        builder => builder
            .AllowAnyOrigin()  // Allow requests from any origin
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

var port = app.Environment.IsDevelopment()
    ? (args.Length > 0 && int.TryParse(args[0], out var parsedPort) && parsedPort >= 49152 && parsedPort <= 65535 ? parsedPort : 5000)
    : (args.Length > 0 && int.TryParse(args[0], out parsedPort) && parsedPort >= 49152 && parsedPort <= 65535 ? parsedPort : 80);

app.UseHttpsRedirection();
app.UseAuthorization();
app.UseCors("AllowAllOrigins");
app.MapControllers();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.Run();
}
else
{
    app.Run($"http://0.0.0.0:{port}");
}
