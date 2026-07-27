using INK.ERP.Domain.Common;

namespace INK.ERP.Domain.Entities.IAM;

public sealed class LoginHistory : AuditableEntity
{
    public Guid? UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public bool Successful { get; set; }
    public bool Failed { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Browser { get; set; } = string.Empty;
    public string Device { get; set; } = string.Empty;
    public string OS { get; set; } = string.Empty;
    public string IP { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    // Navigation
    public ApplicationUser? User { get; set; }
}
