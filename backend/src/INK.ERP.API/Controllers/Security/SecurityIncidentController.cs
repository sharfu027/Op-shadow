using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using INK.ERP.Application.Features.Security.Incidents;
using INK.ERP.Application.Features.Security.Incidents.DTOs;

namespace INK.ERP.API.Controllers.Security;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/security/incident")]
public class SecurityIncidentController : BaseApiController
{
    /// <summary>
    /// Retrieves open security incidents (optionally filtered by User ID).
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "Security.Risk.View")]
    [ProducesResponseType(typeof(IReadOnlyList<SecurityIncidentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetIncidents([FromQuery] Guid? userId, CancellationToken cancellationToken)
    {
        var query = new GetOpenIncidentsQuery(userId);
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Retrieves details for a specific security incident by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Policy = "Security.Risk.View")]
    [ProducesResponseType(typeof(IReadOnlyList<SecurityIncidentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetIncidentById(Guid id, CancellationToken cancellationToken)
    {
        var query = new GetUserSecurityIncidentsQuery(id);
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Manually raises a new security incident report.
    /// </summary>
    [HttpPost("raise")]
    [Authorize(Policy = "Security.Risk.View")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Raise([FromBody] RaiseSecurityIncidentCommand command, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Resolves an active security incident with investigation resolution notes.
    /// </summary>
    [HttpPost("resolve")]
    [Authorize(Policy = "Security.Risk.View")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Resolve([FromBody] ResolveSecurityIncidentCommand command, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Retrieves all unresolved critical-severity security incidents.
    /// </summary>
    [HttpGet("critical")]
    [Authorize(Policy = "Security.Risk.View")]
    [ProducesResponseType(typeof(IReadOnlyList<SecurityIncidentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCriticalIncidents(CancellationToken cancellationToken)
    {
        var query = new GetCriticalIncidentsQuery();
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(result);
    }
}
