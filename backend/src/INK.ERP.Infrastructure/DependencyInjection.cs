using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Hangfire;
using Hangfire.PostgreSql;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Common;
using INK.ERP.Infrastructure.Options;
using INK.ERP.Infrastructure.Persistence.Repositories;
using INK.ERP.Infrastructure.Persistence.Outbox;
using INK.ERP.Infrastructure.Services;
using INK.ERP.Infrastructure.Security;
using INK.ERP.Persistence;
using OpenTelemetry.Trace;


namespace INK.ERP.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Register and Validate Configuration Options
        services.AddOptions<DatabaseOptions>()
            .Bind(configuration.GetSection(DatabaseOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<RedisOptions>()
            .Bind(configuration.GetSection(RedisOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<HangfireOptions>()
            .Bind(configuration.GetSection(HangfireOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<OpenTelemetryOptions>()
            .Bind(configuration.GetSection(OpenTelemetryOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddOptions<ApplicationOptions>()
            .Bind(configuration.GetSection(ApplicationOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        var databaseOptions = configuration.GetSection(DatabaseOptions.SectionName).Get<DatabaseOptions>() ?? new DatabaseOptions();
        var jwtOptions = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
        var redisOptions = configuration.GetSection(RedisOptions.SectionName).Get<RedisOptions>() ?? new RedisOptions();
        var hangfireOptions = configuration.GetSection(HangfireOptions.SectionName).Get<HangfireOptions>() ?? new HangfireOptions();

        // 2. Configure EF Core & PostgreSQL Database
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseNpgsql(databaseOptions.ConnectionString, npgsqlOptions =>
            {
                npgsqlOptions.CommandTimeout(databaseOptions.CommandTimeoutSeconds);
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: databaseOptions.MaxRetryCount,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorCodesToAdd: null);
                npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "iam");
            });

            if (databaseOptions.EnableSensitiveDataLogging)
            {
                options.EnableSensitiveDataLogging();
                options.EnableDetailedErrors();
            }
        });

        // 3. Configure ASP.NET Identity
        services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequiredLength = 8;

            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;

            options.User.RequireUniqueEmail = true;
        })
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();

        // 4. Configure JWT Authentication & Token Validation
        var jwtKey = Encoding.UTF8.GetBytes(jwtOptions.Secret);
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false; // Turn on for Production
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtOptions.Issuer,
                ValidAudience = jwtOptions.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(jwtKey),
                ClockSkew = TimeSpan.Zero
            };
        });

        // 5. Configure Redis Caching
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = redisOptions.ConnectionString;
            options.InstanceName = redisOptions.InstanceName;
        });

        // 6. Configure Hangfire Background Job Processing with PostgreSQL Storage
        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(options =>
            {
                options.UseNpgsqlConnection(hangfireOptions.ConnectionString);
            }, new PostgreSqlStorageOptions
            {
                SchemaName = hangfireOptions.SchemaName,
                PrepareSchemaIfNecessary = true
            }));

        services.AddHangfireServer();

        // 7. Register Repositories & Unit of Work
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IWarehouseRepository, WarehouseRepository>();
        services.AddScoped<ISalesOrderRepository, SalesOrderRepository>();

        // 8. Register Security Token Generator Service
        services.AddScoped<ITokenService, TokenService>();

        // 9. Register Current User Abstraction & Context Accessor
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        // 10. Register Outbox Processor Background Service
        services.AddHostedService<OutboxProcessor>();

        // 11. Configure Enterprise Health Checks
        services.AddHealthChecks()
            .AddNpgSql(databaseOptions.ConnectionString, name: "PostgreSQL")
            .AddRedis(redisOptions.ConnectionString, name: "Redis")
            .AddHangfire(options =>
            {
                options.MinimumAvailableServers = 1;
            }, name: "Hangfire");

        // 12. Configure OpenTelemetry Tracing
        var enableTracing = configuration.GetValue<bool>("OpenTelemetry:EnableTracing", false);
        if (enableTracing)
        {
            services.AddOpenTelemetry()
                .WithTracing(tracing => tracing
                    .AddAspNetCoreInstrumentation()
                    .AddEntityFrameworkCoreInstrumentation()
                    .AddHttpClientInstrumentation());
        }

        // 13. Register StackExchange.Redis ConnectionMultiplexer
        services.AddSingleton<IConnectionMultiplexer>(sp => 
            ConnectionMultiplexer.Connect(redisOptions.ConnectionString));

        // 14. Register Caching, File Storage, and Distributed Lock Services
        services.AddScoped<ICacheService, RedisCacheService>();
        services.AddScoped<IDistributedLockService, RedisDistributedLockService>();
        services.AddScoped<IPostgresAdvisoryLockService, PostgresAdvisoryLockService>();
        services.AddSingleton<IFileStorageService, LocalFileStorageService>();

        // 15. Register Idempotency Store
        services.AddScoped<IIdempotencyStore, RedisIdempotencyStore>();

        return services;
    }
}
