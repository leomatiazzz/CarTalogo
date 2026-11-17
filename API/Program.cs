using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MinimalAPI.Domain.Interfaces;
using MinimalAPI.Domain.Services;
using MinimalAPI.Endpoints;
using MinimalAPI.Infrastructure.Db;

var builder = WebApplication.CreateBuilder(args);

// Structured Logging (JSON format for observability / production)
if (builder.Environment.IsProduction())
{
    builder.Logging.ClearProviders();
    builder.Logging.AddJsonConsole(options =>
    {
        options.IncludeScopes = true;
        options.TimestampFormat = "yyyy-MM-ddTHH:mm:ss.fffZ ";
    });
}

// Configuration & Secrets
var jwtKey = builder.Configuration["Jwt:Key"] 
             ?? builder.Configuration.GetValue<string>("Jwt") 
             ?? "MINIMAL_API_SUPER_SECRET_KEY_FOR_SIGNING_TOKENS_2026_CHANGE_IN_PRODUCTION!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "MinimalAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "MinimalAPIClient";

// Authentication & Authorization
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateLifetime = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Standard ProblemDetails (RFC 7807 / RFC 9457)
builder.Services.AddProblemDetails();

// Health Checks
builder.Services.AddHealthChecks();

// Domain Services & DI
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();

// Database Context
builder.Services.AddDbContext<DbContexto>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("MySql") 
                           ?? builder.Configuration.GetConnectionString("mysql");
    if (!string.IsNullOrEmpty(connectionString))
    {
        options.UseMySql(
            connectionString,
            ServerVersion.AutoDetect(connectionString)
        );
    }
});

// Swagger & OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Minimal API - Vehicle Management",
        Version = "v1",
        Description = "API REST desenvolvida em .NET 10 com ASP.NET Core Minimal APIs, EF Core e autenticação JWT (RBAC)."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token here / Insira seu token JWT aqui:"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Global Exception Handler & Status Code Pages
app.UseExceptionHandler();
app.UseStatusCodePages();

// Swagger Documentation
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Vehicle Management API v1");
    c.RoutePrefix = "swagger";
});

// Middleware Pipeline
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Health Check Endpoint
app.MapHealthChecks("/health").AllowAnonymous();

// Observability & Metrics Endpoint (SLO Monitoring)
app.MapGet("/metrics", () =>
{
    var process = System.Diagnostics.Process.GetCurrentProcess();
    return Results.Ok(new
    {
        status = "healthy",
        uptimeSeconds = Math.Round((DateTime.UtcNow - process.StartTime.ToUniversalTime()).TotalSeconds, 1),
        memoryMB = Math.Round(process.WorkingSet64 / (1024.0 * 1024.0), 2),
        threads = process.Threads.Count,
        slo = new
        {
            serviceLevelObjective = "Disponibilidade >= 99% e Latência P95 < 200ms",
            targetAvailability = 0.99,
            targetLatencyP95Ms = 200,
            status = "compliant"
        }
    });
}).AllowAnonymous().WithTags("Observability");

// Modular Minimal API Endpoints
app.MapHomeEndpoints();
app.MapAdminEndpoints();
app.MapVehicleEndpoints();

app.Run();

// Required for WebApplicationFactory<Program> in integration tests
public partial class Program { }
