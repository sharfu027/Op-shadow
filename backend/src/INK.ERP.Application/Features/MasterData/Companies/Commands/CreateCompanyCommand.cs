using MediatR;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Application.Features.MasterData.Companies.DTOs;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.Entities.MasterData;
using INK.ERP.Domain.ValueObjects;

namespace INK.ERP.Application.Features.MasterData.Companies.Commands;

public record CreateCompanyCommand(
    string Code,
    string LegalName,
    string? TradeName,
    string TaxRegistrationNumber,
    string PanNumber,
    string Email,
    string Phone,
    string CurrencyCode,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string PostalCode,
    string Country) : IRequest<Result<CompanyDto>>;

public class CreateCompanyCommandHandler : IRequestHandler<CreateCompanyCommand, Result<CompanyDto>>
{
    private readonly ICompanyRepository _companyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCompanyCommandHandler(ICompanyRepository companyRepository, IUnitOfWork unitOfWork)
    {
        _companyRepository = companyRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CompanyDto>> Handle(CreateCompanyCommand request, CancellationToken cancellationToken)
    {
        if (!await _companyRepository.IsCodeUniqueAsync(request.Code, null, cancellationToken))
        {
            return Result<CompanyDto>.Failure(Error.Conflict("Company.DuplicateCode", $"Company code '{request.Code}' is already registered."));
        }

        if (!await _companyRepository.IsTaxRegistrationNumberUniqueAsync(request.TaxRegistrationNumber, null, cancellationToken))
        {
            return Result<CompanyDto>.Failure(Error.Conflict("Company.DuplicateTaxReg", $"Tax Registration Number '{request.TaxRegistrationNumber}' is already registered."));
        }

        var company = new Company
        {
            Code = request.Code.ToUpperInvariant().Trim(),
            LegalName = request.LegalName.Trim(),
            TradeName = request.TradeName?.Trim(),
            TaxRegistrationNumber = request.TaxRegistrationNumber.Trim(),
            PanNumber = request.PanNumber.ToUpperInvariant().Trim(),
            Email = request.Email.Trim(),
            Phone = request.Phone.Trim(),
            CurrencyCode = string.IsNullOrWhiteSpace(request.CurrencyCode) ? "INR" : request.CurrencyCode.ToUpperInvariant().Trim(),
            Address = new Address(request.AddressLine1, request.AddressLine2, request.City, request.State, request.PostalCode, request.Country),
            IsActive = true
        };

        await _companyRepository.AddAsync(company, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
