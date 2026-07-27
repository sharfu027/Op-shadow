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

        builder.Entity<INK.ERP.Infrastructure.Persistence.Outbox.OutboxMessage>(entity =>
        {
            entity.ToTable("outbox_messages", "iam");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.OccurredOnUtc).IsRequired();
        });
    }

    public DbSet<INK.ERP.Infrastructure.Persistence.Outbox.OutboxMessage> OutboxMessages => Set<INK.ERP.Infrastructure.Persistence.Outbox.OutboxMessage>();

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
