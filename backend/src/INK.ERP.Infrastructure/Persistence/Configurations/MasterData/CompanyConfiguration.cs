using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using INK.ERP.Domain.Entities.MasterData;

namespace INK.ERP.Infrastructure.Persistence.Configurations.MasterData;

public class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.ToTable("companies", "organization");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(c => c.LegalName)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(c => c.TradeName)
            .HasMaxLength(150);

        builder.Property(c => c.TaxRegistrationNumber)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(c => c.PanNumber)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(c => c.Email)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Phone)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(c => c.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3)
            .HasDefaultValue("INR");

        builder.OwnsOne(c => c.Address, address =>
        {
            address.Property(a => a.AddressLine1).HasColumnName("address_line1").HasMaxLength(150).IsRequired();
            address.Property(a => a.AddressLine2).HasColumnName("address_line2").HasMaxLength(150);
            address.Property(a => a.City).HasColumnName("city").HasMaxLength(50).IsRequired();
            address.Property(a => a.State).HasColumnName("state").HasMaxLength(50).IsRequired();
            address.Property(a => a.PostalCode).HasColumnName("postal_code").HasMaxLength(15).IsRequired();
            address.Property(a => a.Country).HasColumnName("country").HasMaxLength(50).IsRequired();
        });

        builder.HasIndex(c => c.Code)
            .IsUnique()
            .HasFilter("is_deleted = false");

        builder.HasIndex(c => c.TaxRegistrationNumber)
            .IsUnique()
            .HasFilter("is_deleted = false");
    }
}
