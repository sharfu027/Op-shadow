namespace INK.ERP.Application.Features.MasterData.Companies.DTOs;

public record CompanyDto(
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
    bool IsActive,
    DateTime CreatedAtUtc);
