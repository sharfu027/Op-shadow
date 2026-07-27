using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Entities;
using INK.ERP.Persistence;

namespace INK.ERP.Infrastructure.Persistence.Repositories;

public sealed class CustomerRepository : GenericRepository<Customer>, ICustomerRepository
{
    public CustomerRepository(AppDbContext context) : base(context)
    {
    }
}
