using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using INK.ERP.Domain.Common;

namespace INK.ERP.Persistence;

public sealed class AppDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Apply schema configurations and clean architecture mapping conventions
        builder.HasDefaultSchema("iam");

        // Identity Table Renaming for enterprise schema alignment
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("user_claims", "iam");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("user_roles", "iam");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("user_logins", "iam");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("role_claims", "iam");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("user_tokens", "iam");

        builder.Entity<INK.ERP.Infrastructure.Persistence.Outbox.OutboxMessage>(entity =>
        {
            entity.ToTable("outbox_messages", "iam");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.OccurredOnUtc).IsRequired();
        });

        builder.Entity<INK.ERP.Domain.Entities.Product>(entity => { entity.ToTable("products", "product"); });
        builder.Entity<INK.ERP.Domain.Entities.Customer>(entity => { entity.ToTable("customers", "customer"); });
        builder.Entity<INK.ERP.Domain.Entities.Warehouse>(entity => { entity.ToTable("warehouses", "warehouse"); });
        builder.Entity<INK.ERP.Domain.Entities.SalesOrder>(entity => { entity.ToTable("sales_orders", "sales"); });

        // Apply all configurations from the assembly (runs all IEntityTypeConfiguration classes)
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public DbSet<INK.ERP.Infrastructure.Persistence.Outbox.OutboxMessage> OutboxMessages => Set<INK.ERP.Infrastructure.Persistence.Outbox.OutboxMessage>();
    public DbSet<INK.ERP.Domain.Entities.Product> Products => Set<INK.ERP.Domain.Entities.Product>();
    public DbSet<INK.ERP.Domain.Entities.Customer> Customers => Set<INK.ERP.Domain.Entities.Customer>();
    public DbSet<INK.ERP.Domain.Entities.Warehouse> Warehouses => Set<INK.ERP.Domain.Entities.Warehouse>();
    public DbSet<INK.ERP.Domain.Entities.SalesOrder> SalesOrders => Set<INK.ERP.Domain.Entities.SalesOrder>();

    // IAM DB Sets
    public DbSet<INK.ERP.Domain.Entities.IAM.PermissionGroup> PermissionGroups => Set<INK.ERP.Domain.Entities.IAM.PermissionGroup>();
    public DbSet<INK.ERP.Domain.Entities.IAM.Permission> Permissions => Set<INK.ERP.Domain.Entities.IAM.Permission>();
    public DbSet<INK.ERP.Domain.Entities.IAM.UserRole> IAMUserRoles => Set<INK.ERP.Domain.Entities.IAM.UserRole>();
    public DbSet<INK.ERP.Domain.Entities.IAM.RolePermission> RolePermissions => Set<INK.ERP.Domain.Entities.IAM.RolePermission>();
    public DbSet<INK.ERP.Domain.Entities.IAM.RefreshToken> RefreshTokens => Set<INK.ERP.Domain.Entities.IAM.RefreshToken>();
    public DbSet<INK.ERP.Domain.Entities.IAM.UserSession> UserSessions => Set<INK.ERP.Domain.Entities.IAM.UserSession>();
    public DbSet<INK.ERP.Domain.Entities.IAM.LoginHistory> LoginHistories => Set<INK.ERP.Domain.Entities.IAM.LoginHistory>();
    public DbSet<INK.ERP.Domain.Entities.IAM.PasswordResetToken> PasswordResetTokens => Set<INK.ERP.Domain.Entities.IAM.PasswordResetToken>();
    public DbSet<INK.ERP.Domain.Entities.IAM.EmailVerificationToken> EmailVerificationTokens => Set<INK.ERP.Domain.Entities.IAM.EmailVerificationToken>();
    public DbSet<INK.ERP.Domain.Entities.IAM.UserPreference> UserPreferences => Set<INK.ERP.Domain.Entities.IAM.UserPreference>();
    public DbSet<INK.ERP.Domain.Entities.IAM.SecurityAuditLog> SecurityAuditLogs => Set<INK.ERP.Domain.Entities.IAM.SecurityAuditLog>();

    // Enterprise Security DB Sets
    public DbSet<INK.ERP.Domain.Entities.Security.FaceProfile> FaceProfiles => Set<INK.ERP.Domain.Entities.Security.FaceProfile>();
    public DbSet<INK.ERP.Domain.Entities.Security.FaceTemplate> FaceTemplates => Set<INK.ERP.Domain.Entities.Security.FaceTemplate>();
    public DbSet<INK.ERP.Domain.Entities.Security.FaceVerificationLog> FaceVerificationLogs => Set<INK.ERP.Domain.Entities.Security.FaceVerificationLog>();
    public DbSet<INK.ERP.Domain.Entities.Security.FaceEnrollmentLog> FaceEnrollmentLogs => Set<INK.ERP.Domain.Entities.Security.FaceEnrollmentLog>();
    public DbSet<INK.ERP.Domain.Entities.Security.SecurityPolicy> SecurityPolicies => Set<INK.ERP.Domain.Entities.Security.SecurityPolicy>();
    public DbSet<INK.ERP.Domain.Entities.Security.UserSecurityPolicy> UserSecurityPolicies => Set<INK.ERP.Domain.Entities.Security.UserSecurityPolicy>();
    public DbSet<INK.ERP.Domain.Entities.Security.RegisteredDevice> RegisteredDevices => Set<INK.ERP.Domain.Entities.Security.RegisteredDevice>();
    public DbSet<INK.ERP.Domain.Entities.Security.SecurityIncident> SecurityIncidents => Set<INK.ERP.Domain.Entities.Security.SecurityIncident>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        ConvertDomainEventsToOutboxMessages();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        UpdateAuditFields();
        ConvertDomainEventsToOutboxMessages();
        return base.SaveChanges();
    }

    private void ConvertDomainEventsToOutboxMessages()
    {
        var domainEntities = ChangeTracker.Entries<BaseEntity>()
            .Where(x => x.Entity.DomainEvents.Any())
            .ToList();

        var domainEvents = domainEntities
            .SelectMany(x => x.Entity.DomainEvents)
            .ToList();

        foreach (var domainEvent in domainEvents)
        {
            var outboxMessage = new INK.ERP.Infrastructure.Persistence.Outbox.OutboxMessage
            {
                Type = domainEvent.GetType().AssemblyQualifiedName ?? domainEvent.GetType().FullName ?? string.Empty,
                Content = System.Text.Json.JsonSerializer.Serialize(domainEvent, domainEvent.GetType()),
                OccurredOnUtc = DateTime.UtcNow
            };

            Set<INK.ERP.Infrastructure.Persistence.Outbox.OutboxMessage>().Add(outboxMessage);
        }

        foreach (var entity in domainEntities)
        {
            entity.Entity.ClearDomainEvents();
        }
    }

    private void UpdateAuditFields()
    {
        var entries = ChangeTracker.Entries();
        var utcNow = DateTime.UtcNow;

        foreach (var entry in entries)
        {
            if (entry.Entity is BaseEntity baseEntity)
            {
                if (entry.State == EntityState.Added)
                {
                    // Use reflection/backing field to set Id and CreatedAtUtc since setters are protected
                    entry.Property(nameof(BaseEntity.CreatedAtUtc)).CurrentValue = utcNow;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Property(nameof(BaseEntity.LastModifiedAtUtc)).CurrentValue = utcNow;
                }
            }

            // Audit custom application user edits
            if (entry.Entity is ApplicationUser appUser)
            {
                if (entry.State == EntityState.Added)
                {
                    appUser.CreatedAtUtc = utcNow;
                }
                else if (entry.State == EntityState.Modified)
                {
                    appUser.LastModifiedAtUtc = utcNow;
                }
            }
        }
    }
}
