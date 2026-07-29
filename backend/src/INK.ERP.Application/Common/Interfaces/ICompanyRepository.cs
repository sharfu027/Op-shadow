using INK.ERP.Domain.Entities.MasterData;

namespace INK.ERP.Application.Common.Interfaces;

public interface ICompanyRepository : IGenericRepository<Company>
{
    Task<bool> IsCodeUniqueAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task<bool> IsTaxRegistrationNumberUniqueAsync(string taxRegistrationNumber, Guid? excludeId = null, CancellationToken cancellationToken = default);
}
