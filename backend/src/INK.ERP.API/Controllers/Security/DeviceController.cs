using System.Text.Json;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using INK.ERP.API.Models;
using INK.ERP.Application.Features.Security.Device;
using INK.ERP.Application.Features.Security.Device.DTOs;

namespace INK.ERP.API.Controllers.Security;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/security/device")]
public class DeviceController : BaseApiController
{
    /// <summary>
    /// Approves a registered device for user access. Supports Idempotency-Key.
    /// </summary>
    [HttpPost("approve")]
    [Authorize(Policy = "Security.Device.Manage")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
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
    /// Flags an approved device as trusted. Supports Idempotency-Key.
    /// </summary>
    [HttpPost("trust")]
    [Authorize(Policy = "Security.Device.Manage")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
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
    /// Retrieves registered devices for a user with standardized pagination, filtering, and X-Pagination header.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "Security.Device.Manage")]
    [ProducesResponseType(typeof(IReadOnlyList<RegisteredDeviceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDevices([FromQuery] Guid userId, [FromQuery] SecurityFilterParameters filter, CancellationToken cancellationToken)
    {
        var query = new GetTrustedDevicesQuery(userId);
        var result = await Mediator.Send(query, cancellationToken);
        if (result.IsSuccess && result.Value != null)
        {
            var devices = result.Value.AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Status))
            {
                devices = devices.Where(d => string.Equals(d.Status, filter.Status, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                devices = devices.Where(d => d.DeviceName.Contains(filter.Search, StringComparison.OrdinalIgnoreCase) || d.DeviceModel.Contains(filter.Search, StringComparison.OrdinalIgnoreCase));
            }

            int totalCount = devices.Count();
            var pagedDevices = devices.Skip((filter.Page - 1) * filter.PageSize).Take(filter.PageSize).ToList();
            int totalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize);

            var paginationMetadata = new PaginationMetadata(totalCount, filter.PageSize, filter.Page, totalPages);
            Response.Headers["X-Pagination"] = JsonSerializer.Serialize(paginationMetadata);

            return Ok(pagedDevices);
        }

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
