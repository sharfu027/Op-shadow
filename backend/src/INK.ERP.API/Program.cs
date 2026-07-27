using INK.ERP.API.Middleware;
using INK.ERP.Application;
using INK.ERP.Infrastructure;
using INK.ERP.Shared;
using Serilog;
using Asp.Versioning;
using Hangfire;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure Serilog Logging
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .WriteTo.Console());

// 2. Configure Clean Architecture Layer Dependency Injections
builder.Services.AddSharedServices();
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// 3. Configure API Controllers, ProblemDetails & Exception Handler
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// 4. Configure API Versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
})
.AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

// 5. Configure SignalR Hubs
builder.Services.AddSignalR();

// 6. Configure Health Checks (Base registered, ready indicators verified in Infrastructure)
builder.Services.AddHealthChecks();

// 7. Configure Rate Limiting (Fixed Window Strategy for Authentication)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddFixedWindowLimiter("AuthPolicy", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 5; // Max 5 requests per minute
        opt.QueueLimit = 0;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });
});

// 8. Configure Swagger / OpenAPI Documentation with JWT Bearer Security
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "INK FMCG Enterprise ERP API",
        Version = "v1",
        Description = "Enterprise FMCG Distribution ERP Platform API - ASP.NET Core 9 Clean Architecture Foundation"
    });

    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 9. Configure Enterprise CORS Policy
var corsOrigins = builder.Configuration.GetSection("AllowedCorsOrigins").Get<string[]>() ?? new[] { "http://localhost:3000" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendClient", policy =>
    {
        policy.WithOrigins(corsOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Pipeline Middleware Configuration
app.UseExceptionHandler();
app.UseStatusCodePages();

// 1. Request Correlation ID Setup
app.UseMiddleware<CorrelationIdMiddleware>();

// 2. Security Headers Enforcement
app.UseMiddleware<SecurityHeadersMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "INK FMCG ERP API v1");
    });
}

app.UseSerilogRequestLogging();
app.UseCors("AllowFrontendClient");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

// Register Hangfire Dashboard Middleware
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    // Configure authorization policies for dashboard access if needed
});

// Mapped Health check endpoints
app.MapHealthChecks("/health"); // Simple ping
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false // Liveness check (always returns healthy if service is running)
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = reg => reg.Name == "PostgreSQL" || reg.Name == "Redis" || reg.Name == "Hangfire"
});

app.MapControllers();

app.Run();

public partial class Program { }
