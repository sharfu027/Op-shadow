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
        builder.Entity<ApplicationUser>(entity =>
        {
            entity.ToTable("users", "iam");
            entity.Property(u => u.FirstName).HasMaxLength(100);
            entity.Property(u => u.LastName).HasMaxLength(100);
        });

        builder.Entity<ApplicationRole>(entity =>
        {
            entity.ToTable("roles", "iam");
            entity.Property(r => r.Description).HasMaxLength(250);
        });

        builder.Entity<IdentityUserClaim<Guid>>().ToTable("user_claims", "iam");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("user_roles", "iam");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("user_logins", "iam");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("role_claims", "iam");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("user_tokens", "iam");
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        UpdateAuditFields();
        return base.SaveChanges();
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
