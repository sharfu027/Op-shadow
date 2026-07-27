using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Common;
using INK.ERP.Persistence;

namespace INK.ERP.Infrastructure.Persistence.Repositories;

public sealed class RoleRepository : GenericRepository<ApplicationRole>, IRoleRepository
{
    public RoleRepository(AppDbContext context) : base(context)
    {
    }
}
