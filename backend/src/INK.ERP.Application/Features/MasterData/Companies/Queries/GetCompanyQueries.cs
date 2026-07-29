using MediatR;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Application.Features.MasterData.Companies.DTOs;
using INK.ERP.Domain.Common;

namespace INK.ERP.Application.Features.MasterData.Companies.Queries;

public record GetCompanyByIdQuery(Guid Id) : IRequest<Result<CompanyDto>>;

public class GetCompanyByIdQueryHandler : IRequestHandler<GetCompanyByIdQuery, Result<CompanyDto>>
{
    private readonly ICompanyRepository _companyRepository;

    public GetCompanyByIdQueryHandler(ICompanyRepository companyRepository)
    {
        _companyRepository = companyRepository;
    }

    public async Task<Result<CompanyDto>> Handle(GetCompanyByIdQuery request, CancellationToken cancellationToken)
    {
        var company = await _companyRepository.GetByIdAsync(request.Id, cancellationToken);
        if (company == null)
        {
            return Result<CompanyDto>.Failure(Error.NotFound("Company.NotFound", $"Company with ID '{request.Id}' was not found."));
        }

        var dto = new CompanyDto(
            company.Id,
            company.Code,
            company.LegalName,
            company.TradeName,
            company.TaxRegistrationNumber,
            company.PanNumber,
            company.Email,
            company.Phone,
            company.CurrencyCode,
            company.Address.AddressLine1,
            company.Address.AddressLine2,
            company.Address.City,
            company.Address.State,
            company.Address.PostalCode,
            company.Address.Country,
            company.IsActive,
            company.CreatedAtUtc);

        return Result<CompanyDto>.Success(dto);
    }
}

public record GetCompaniesPagedQuery(
    int Page = 1,
    int PageSize = 10,
    string? Search = null,
    string? Status = null) : IRequest<Result<IReadOnlyList<CompanyDto>>>;

public class GetCompaniesPagedQueryHandler : IRequestHandler<GetCompaniesPagedQuery, Result<IReadOnlyList<CompanyDto>>>
{
    private readonly ICompanyRepository _companyRepository;

    public GetCompaniesPagedQueryHandler(ICompanyRepository companyRepository)
    {
        _companyRepository = companyRepository;
    }

    public async Task<Result<IReadOnlyList<CompanyDto>>> Handle(GetCompaniesPagedQuery request, CancellationToken cancellationToken)
    {
        var companies = await _companyRepository.GetAllAsync(cancellationToken);
        var query = companies.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(c => c.Code.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                                     c.LegalName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                                     c.TaxRegistrationNumber.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(request.Status) && !string.Equals(request.Status, "All", StringComparison.OrdinalIgnoreCase))
        {
            bool isActive = string.Equals(request.Status, "Active", StringComparison.OrdinalIgnoreCase);
            query = query.Where(c => c.IsActive == isActive);
        }

        var list = query
            .OrderBy(c => c.Code)
            .Select(company => new CompanyDto(
                company.Id,
                company.Code,
                company.LegalName,
                company.TradeName,
                company.TaxRegistrationNumber,
                company.PanNumber,
                company.Email,
                company.Phone,
                company.CurrencyCode,
                company.Address.AddressLine1,
                company.Address.AddressLine2,
                company.Address.City,
                company.Address.State,
                company.Address.PostalCode,
                company.Address.Country,
                company.IsActive,
                company.CreatedAtUtc))
            .ToList();

        return Result<IReadOnlyList<CompanyDto>>.Success(list);
    }
}
