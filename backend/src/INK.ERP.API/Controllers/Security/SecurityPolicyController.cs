using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using INK.ERP.Application.Features.Security.Policies;
using INK.ERP.Application.Features.Security.Policies.DTOs;

namespace INK.ERP.API.Controllers.Security;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/security/policy")]
public class SecurityPolicyController : BaseApiController
{
    /// <summary>
    /// Resolves the effective security policy for a specific user (global policy + user overrides).
    /// </summary>
    [HttpGet("effective")]
    [Authorize(Policy = "Security.Policy.Manage")]
    [ProducesResponseType(typeof(EffectiveSecurityPolicyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEffectivePolicy([FromQuery] Guid userId, CancellationToken cancellationToken)
    {
        var query = new GetEffectiveSecurityPolicyQuery(userId);
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Updates system-wide global security policy settings.
    /// </summary>
    [HttpPut("global")]
    [Authorize(Policy = "Security.Policy.Manage")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateGlobalPolicy([FromBody] UpdateGlobalSecurityPolicyCommand command, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Configures user-level security policy overrides.
    /// </summary>
    [HttpPut("user")]
    [Authorize(Policy = "Security.Policy.Manage")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateUserPolicy([FromBody] UpdateUserSecurityPolicyCommand command, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Retrieves active global security policy details.
    /// </summary>
    [HttpGet("history")]
    [Authorize(Policy = "Security.Policy.Manage")]
    [ProducesResponseType(typeof(SecurityPolicyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPolicyHistory(CancellationToken cancellationToken)
    {
        var query = new GetActiveGlobalSecurityPolicyQuery();
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(result);
    }
}
