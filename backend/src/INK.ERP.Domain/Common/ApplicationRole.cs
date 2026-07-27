using Microsoft.AspNetCore.Identity;

namespace INK.ERP.Domain.Common;

public sealed class ApplicationRole : IdentityRole<Guid>
{
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
