using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.Entities.IAM;
using INK.ERP.Domain.Entities.Security;
using INK.ERP.Domain.Entities.MasterData;

namespace INK.ERP.Persistence;

public class AppDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

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

        builder.Entity<INK.ERP.Domain.Entities.Warehouse>(entity => { entity.ToTable("warehouses", "warehouse"); });
        builder.Entity<INK.ERP.Domain.Entities.SalesOrder>(entity => { entity.ToTable("sales_orders", "sales"); });

        // Apply all configurations from the assembly (runs all IEntityTypeConfiguration classes)
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public DbSet<INK.ERP.Infrastructure.Persistence.Outbox.OutboxMessage> OutboxMessages => Set<INK.ERP.Infrastructure.Persistence.Outbox.OutboxMessage>();
    public DbSet<INK.ERP.Domain.Entities.Warehouse> Warehouses => Set<INK.ERP.Domain.Entities.Warehouse>();
    public DbSet<INK.ERP.Domain.Entities.SalesOrder> SalesOrders => Set<INK.ERP.Domain.Entities.SalesOrder>();

    // Master Data DB Sets
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Designation> Designations => Set<Designation>();
    public DbSet<UnitOfMeasure> UnitsOfMeasure => Set<UnitOfMeasure>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Employee> Employees => Set<Employee>();

    // IAM DB Sets
    public DbSet<PermissionGroup> PermissionGroups => Set<PermissionGroup>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> IAMUserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<LoginHistory> LoginHistories => Set<LoginHistory>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<EmailVerificationToken> EmailVerificationTokens => Set<EmailVerificationToken>();
    public DbSet<UserPreference> UserPreferences => Set<UserPreference>();
    public DbSet<SecurityAuditLog> SecurityAuditLogs => Set<SecurityAuditLog>();

    // Enterprise Security DB Sets
    public DbSet<FaceProfile> FaceProfiles => Set<FaceProfile>();
    public DbSet<FaceTemplate> FaceTemplates => Set<FaceTemplate>();
    public DbSet<FaceVerificationLog> FaceVerificationLogs => Set<FaceVerificationLog>();
    public DbSet<FaceEnrollmentLog> FaceEnrollmentLogs => Set<FaceEnrollmentLog>();
    public DbSet<SecurityPolicy> SecurityPolicies => Set<SecurityPolicy>();
    public DbSet<UserSecurityPolicy> UserSecurityPolicies => Set<UserSecurityPolicy>();
    public DbSet<RegisteredDevice> RegisteredDevices => Set<RegisteredDevice>();
    public DbSet<SecurityIncident> SecurityIncidents => Set<SecurityIncident>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateAuditFields()
    {
        var entries = ChangeTracker.Entries<BaseEntity>();

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAtUtc = DateTime.UtcNow;
                if (string.IsNullOrEmpty(entry.Entity.CreatedBy))
                {
                    entry.Entity.CreatedBy = "System";
                }
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.LastModifiedAtUtc = DateTime.UtcNow;
                if (string.IsNullOrEmpty(entry.Entity.LastModifiedBy))
                {
                    entry.Entity.LastModifiedBy = "System";
                }
            }
            else if (entry.State == EntityState.Deleted)
            {
                entry.State = EntityState.Modified;
                entry.Entity.IsDeleted = true;
                entry.Entity.DeletedAtUtc = DateTime.UtcNow;
            }
        }
    }
}
