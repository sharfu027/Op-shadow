using System.Security.Claims;
using INK.ERP.Domain.Common;

namespace INK.ERP.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateJwtToken(ApplicationUser user, IList<string> roles, IEnumerable<Claim> customClaims);
}
