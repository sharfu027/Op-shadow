using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Common;
using INK.ERP.Persistence;

namespace INK.ERP.Infrastructure.Persistence.Repositories;

public sealed class UserRepository : GenericRepository<ApplicationUser>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context)
    {
    }
}
