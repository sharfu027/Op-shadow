using Microsoft.EntityFrameworkCore;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Entities.MasterData;
using INK.ERP.Persistence;

namespace INK.ERP.Infrastructure.Persistence.Repositories;

public class SupplierRepository : GenericRepository<Supplier>, ISupplierRepository
{
    public SupplierRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<bool> IsCodeUniqueAsync(Guid companyId, string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var normalizedCode = code.ToUpperInvariant().Trim();
        return !await _dbSet.AnyAsync(s => s.CompanyId == companyId && s.Code == normalizedCode && (!excludeId.HasValue || s.Id != excludeId.Value), cancellationToken);
    }

    public async Task<bool> IsGstinUniqueAsync(Guid companyId, string gstin, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var normalizedGstin = gstin.ToUpperInvariant().Trim();
        return !await _dbSet.AnyAsync(s => s.CompanyId == companyId && s.Gstin == normalizedGstin && (!excludeId.HasValue || s.Id != excludeId.Value), cancellationToken);
    }
}
