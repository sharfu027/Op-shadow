using Microsoft.EntityFrameworkCore;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Entities.MasterData;
using INK.ERP.Persistence;

namespace INK.ERP.Infrastructure.Persistence.Repositories;

public class CompanyRepository : GenericRepository<Company>, ICompanyRepository
{
    public CompanyRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var normalizedCode = code.ToUpperInvariant().Trim();
        return !await _dbSet.AnyAsync(c => c.Code == normalizedCode && (!excludeId.HasValue || c.Id != excludeId.Value), cancellationToken);
    }

    public async Task<bool> IsTaxRegistrationNumberUniqueAsync(string taxRegistrationNumber, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var normalizedTaxReg = taxRegistrationNumber.Trim();
        return !await _dbSet.AnyAsync(c => c.TaxRegistrationNumber == normalizedTaxReg && (!excludeId.HasValue || c.Id != excludeId.Value), cancellationToken);
    }
}
