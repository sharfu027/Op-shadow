namespace INK.ERP.Domain.Common;

public abstract class AuditableEntity : BaseEntity
{
    public string? CreatedBy { get; set; }
    public string? ModifiedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
    public string ConcurrencyToken { get; set; } = Guid.NewGuid().ToString();
}
