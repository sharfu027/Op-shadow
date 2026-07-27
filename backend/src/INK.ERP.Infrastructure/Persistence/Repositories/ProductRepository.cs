using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Entities;
using INK.ERP.Persistence;

namespace INK.ERP.Infrastructure.Persistence.Repositories;

public sealed class ProductRepository : GenericRepository<Product>, IProductRepository
{
    public ProductRepository(AppDbContext context) : base(context)
    {
    }
}
