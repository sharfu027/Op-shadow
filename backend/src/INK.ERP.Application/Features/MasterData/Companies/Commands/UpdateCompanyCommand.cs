using MediatR;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Application.Features.MasterData.Companies.DTOs;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.ValueObjects;

namespace INK.ERP.Application.Features.MasterData.Companies.Commands;

public record UpdateCompanyCommand(
    Guid Id,
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
    string Country,
    bool IsActive) : IRequest<Result<CompanyDto>>;

public class UpdateCompanyCommandHandler : IRequestHandler<UpdateCompanyCommand, Result<CompanyDto>>
{
    private readonly ICompanyRepository _companyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCompanyCommandHandler(ICompanyRepository companyRepository, IUnitOfWork unitOfWork)
    {
        _companyRepository = companyRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CompanyDto>> Handle(UpdateCompanyCommand request, CancellationToken cancellationToken)
    {
        var company = await _companyRepository.GetByIdAsync(request.Id, cancellationToken);
        if (company == null)
        {
            return Result<CompanyDto>.Failure(Error.NotFound("Company.NotFound", $"Company with ID '{request.Id}' was not found."));
        }

        if (!await _companyRepository.IsCodeUniqueAsync(request.Code, request.Id, cancellationToken))
        {
            return Result<CompanyDto>.Failure(Error.Conflict("Company.DuplicateCode", $"Company code '{request.Code}' is already registered to another company."));
        }

        if (!await _companyRepository.IsTaxRegistrationNumberUniqueAsync(request.TaxRegistrationNumber, request.Id, cancellationToken))
        {
            return Result<CompanyDto>.Failure(Error.Conflict("Company.DuplicateTaxReg", $"Tax Registration Number '{request.TaxRegistrationNumber}' is already registered to another company."));
        }

        company.Code = request.Code.ToUpperInvariant().Trim();
        company.LegalName = request.LegalName.Trim();
        company.TradeName = request.TradeName?.Trim();
        company.TaxRegistrationNumber = request.TaxRegistrationNumber.Trim();
        company.PanNumber = request.PanNumber.ToUpperInvariant().Trim();
        company.Email = request.Email.Trim();
        company.Phone = request.Phone.Trim();
        company.CurrencyCode = request.CurrencyCode.ToUpperInvariant().Trim();
        company.Address = new Address(request.AddressLine1, request.AddressLine2, request.City, request.State, request.PostalCode, request.Country);
        company.IsActive = request.IsActive;

        await _companyRepository.UpdateAsync(company, cancellationToken);
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

public record DeleteCompanyCommand(Guid Id) : IRequest<Result<Unit>>;

public class DeleteCompanyCommandHandler : IRequestHandler<DeleteCompanyCommand, Result<Unit>>
{
    private readonly ICompanyRepository _companyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCompanyCommandHandler(ICompanyRepository companyRepository, IUnitOfWork unitOfWork)
    {
        _companyRepository = companyRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(DeleteCompanyCommand request, CancellationToken cancellationToken)
    {
        var company = await _companyRepository.GetByIdAsync(request.Id, cancellationToken);
        if (company == null)
        {
            return Result<Unit>.Failure(Error.NotFound("Company.NotFound", $"Company with ID '{request.Id}' was not found."));
        }

        await _companyRepository.DeleteAsync(company, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
