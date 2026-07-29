using INK.ERP.Domain.Common;
using INK.ERP.Domain.ValueObjects;

namespace INK.ERP.Domain.Entities.MasterData;

public sealed class Company : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string LegalName { get; set; } = string.Empty;
    public string? TradeName { get; set; }
    public string TaxRegistrationNumber { get; set; } = string.Empty;
    public string PanNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string CurrencyCode { get; set; } = "INR";
    public Address Address { get; set; } = new();
    public bool IsActive { get; set; } = true;
}
