using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using INK.ERP.Application.Features.Security.Device;
using INK.ERP.Application.Features.Security.Device.DTOs;

namespace INK.ERP.API.Controllers.Security;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/security/device")]
public class DeviceController : BaseApiController
{
    /// <summary>
    /// Approves a registered device for user access.
    /// </summary>
    [HttpPost("approve")]
    [Authorize(Policy = "Security.Device.Manage")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Approve([FromBody] ApproveDeviceCommand command, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Rejects a pending device registration.
    /// </summary>
    [HttpPost("reject")]
    [Authorize(Policy = "Security.Device.Manage")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Reject([FromBody] RejectDeviceCommand command, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Flags an approved device as trusted.
    /// </summary>
    [HttpPost("trust")]
    [Authorize(Policy = "Security.Device.Manage")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Trust([FromBody] TrustDeviceCommand command, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Revokes an existing device approval or trust status.
    /// </summary>
    [HttpPost("revoke")]
    [Authorize(Policy = "Security.Device.Manage")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Revoke([FromBody] RevokeDeviceCommand command, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Records a periodic telemetry heartbeat for a registered device.
    /// </summary>
    [HttpPost("heartbeat")]
    [Authorize(Policy = "Security.Device.Manage")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Heartbeat([FromBody] HeartbeatCommand command, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Retrieves all registered devices for a specified user.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "Security.Device.Manage")]
    [ProducesResponseType(typeof(IReadOnlyList<RegisteredDeviceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDevices([FromQuery] Guid userId, CancellationToken cancellationToken)
    {
        var query = new GetUserDevicesQuery(userId);
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Retrieves all trusted devices for a specified user.
    /// </summary>
    [HttpGet("trusted")]
    [Authorize(Policy = "Security.Device.Manage")]
    [ProducesResponseType(typeof(IReadOnlyList<RegisteredDeviceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTrustedDevices([FromQuery] Guid userId, CancellationToken cancellationToken)
    {
        var query = new GetTrustedDevicesQuery(userId);
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(result);
    }
}
