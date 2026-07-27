using INK.ERP.Domain.Entities.Security;

namespace INK.ERP.Application.Common.Interfaces;

public interface IFaceProfileRepository : IGenericRepository<FaceProfile>
{
    Task<FaceProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}

public interface ISecurityPolicyRepository : IGenericRepository<SecurityPolicy>
{
    Task<SecurityPolicy?> GetActiveGlobalPolicyAsync(CancellationToken cancellationToken = default);
}

public interface IUserSecurityPolicyRepository : IGenericRepository<UserSecurityPolicy>
{
    Task<UserSecurityPolicy?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}

public interface IRegisteredDeviceRepository : IGenericRepository<RegisteredDevice>
{
    Task<IReadOnlyList<RegisteredDevice>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<RegisteredDevice?> GetByFingerprintAsync(Guid userId, string fingerprintHash, CancellationToken cancellationToken = default);
}

public interface ISecurityIncidentRepository : IGenericRepository<SecurityIncident>
{
    Task<IReadOnlyList<SecurityIncident>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}
