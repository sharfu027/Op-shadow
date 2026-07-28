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

// 5. Configure Policy-based Authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("IAM.Users.Read", policy => 
        policy.RequireAssertion(ctx => ctx.User.HasClaim("permission", "users:read") || ctx.User.IsInRole("Administrator") || ctx.User.IsInRole("ADMIN")));

    options.AddPolicy("IAM.Users.Create", policy => 
        policy.RequireAssertion(ctx => ctx.User.HasClaim("permission", "users:create") || ctx.User.IsInRole("Administrator") || ctx.User.IsInRole("ADMIN")));

    options.AddPolicy("IAM.Users.Update", policy => 
        policy.RequireAssertion(ctx => ctx.User.HasClaim("permission", "users:update") || ctx.User.IsInRole("Administrator") || ctx.User.IsInRole("ADMIN")));

    options.AddPolicy("IAM.Users.Delete", policy => 
        policy.RequireAssertion(ctx => ctx.User.HasClaim("permission", "users:delete") || ctx.User.IsInRole("Administrator") || ctx.User.IsInRole("ADMIN")));

    options.AddPolicy("IAM.Roles.Read", policy => 
        policy.RequireAssertion(ctx => ctx.User.HasClaim("permission", "roles:read") || ctx.User.IsInRole("Administrator") || ctx.User.IsInRole("ADMIN")));

    options.AddPolicy("IAM.Roles.Manage", policy => 
        policy.RequireAssertion(ctx => ctx.User.HasClaim("permission", "roles:manage") || ctx.User.IsInRole("Administrator") || ctx.User.IsInRole("ADMIN")));

    options.AddPolicy("IAM.Permissions.Manage", policy => 
        policy.RequireAssertion(ctx => ctx.User.HasClaim("permission", "permissions:manage") || ctx.User.IsInRole("Administrator") || ctx.User.IsInRole("ADMIN")));

    // Enterprise Security Policies
    options.AddPolicy("Security.Face.Enroll", policy =>
        policy.RequireAssertion(ctx => ctx.User.HasClaim("permission", "security.face:enroll") || ctx.User.IsInRole("Administrator") || ctx.User.IsInRole("ADMIN") || ctx.User.IsInRole("SecurityAdmin")));

    options.AddPolicy("Security.Face.Verify", policy =>
        policy.RequireAssertion(ctx => ctx.User.HasClaim("permission", "security.face:verify") || ctx.User.IsInRole("Administrator") || ctx.User.IsInRole("ADMIN") || ctx.User.IsInRole("User")));

    options.AddPolicy("Security.Device.Manage", policy =>
        policy.RequireAssertion(ctx => ctx.User.HasClaim("permission", "security.device:manage") || ctx.User.IsInRole("Administrator") || ctx.User.IsInRole("ADMIN") || ctx.User.IsInRole("SecurityAdmin")));

    options.AddPolicy("Security.Policy.Manage", policy =>
        policy.RequireAssertion(ctx => ctx.User.HasClaim("permission", "security.policy:manage") || ctx.User.IsInRole("Administrator") || ctx.User.IsInRole("ADMIN")));

    options.AddPolicy("Security.Risk.View", policy =>
        policy.RequireAssertion(ctx => ctx.User.HasClaim("permission", "security.risk:view") || ctx.User.IsInRole("Administrator") || ctx.User.IsInRole("ADMIN") || ctx.User.IsInRole("SecurityAdmin")));
});

// 6. Configure SignalR Hubs
builder.Services.AddSignalR();

// 7. Configure Health Checks
builder.Services.AddHealthChecks();

// 8. Configure Rate Limiting Policies
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Anonymous Login Rate Limit
    options.AddFixedWindowLimiter("AuthPolicy", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 10;
        opt.QueueLimit = 0;
    });

    // Authenticated API Rate Limit
    options.AddTokenBucketLimiter("ApiPolicy", opt =>
    {
        opt.TokenLimit = 100;
        opt.QueueLimit = 10;
        opt.ReplenishmentPeriod = TimeSpan.FromMinutes(1);
        opt.TokensPerPeriod = 100;
        opt.AutoReplenishment = true;
    });

    // Admin Endpoints Rate Limit
    options.AddFixedWindowLimiter("AdminPolicy", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 30;
        opt.QueueLimit = 0;
    });

    // Enterprise Security Face Operations Rate Limit
    options.AddFixedWindowLimiter("FacePolicy", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 20;
        opt.QueueLimit = 0;
    });

    // Enterprise Security Risk Engine Rate Limit
    options.AddFixedWindowLimiter("RiskPolicy", opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 30;
        opt.QueueLimit = 0;
    });
});

// 9. Configure Swagger / OpenAPI Documentation with JWT Bearer Security
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "INK FMCG Enterprise ERP API",
        Version = "v1",
        Description = "Enterprise FMCG Distribution ERP Platform API - ASP.NET Core 9 Clean Architecture IAM & Enterprise Security Engine"
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

// 10. Configure Production CORS Policy
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

// ====================================================
// MIDDLEWARE PIPELINE ORDER
// Exception -> Correlation -> Security Headers -> CORS -> Authentication -> Authorization -> Rate Limiting -> Endpoints
// ====================================================

// 1. Exception Handling Middleware
app.UseExceptionHandler();
app.UseStatusCodePages();

// 2. Correlation ID Middleware
app.UseMiddleware<CorrelationIdMiddleware>();

// 3. Security Headers Middleware
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

// 4. CORS
app.UseCors("AllowFrontendClient");

// 5. Authentication
app.UseAuthentication();

// 6. Authorization
app.UseAuthorization();

// 7. Rate Limiting
app.UseRateLimiter();

// Hangfire Dashboard Middleware
app.UseHangfireDashboard("/hangfire", new DashboardOptions());

// 8. Health Check Endpoints
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = reg => reg.Name == "PostgreSQL" || reg.Name == "Redis" || reg.Name == "Hangfire" || reg.Name == "FaceModel"
});

// 9. Map Endpoints
app.MapControllers();

app.Run();

public partial class Program { }
