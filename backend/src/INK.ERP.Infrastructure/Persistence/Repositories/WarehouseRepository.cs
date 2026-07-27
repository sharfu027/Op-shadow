using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Entities;
using INK.ERP.Persistence;

namespace INK.ERP.Infrastructure.Persistence.Repositories;

public sealed class WarehouseRepository : GenericRepository<Warehouse>, IWarehouseRepository
{
    public WarehouseRepository(AppDbContext context) : base(context)
    {
    }
}
