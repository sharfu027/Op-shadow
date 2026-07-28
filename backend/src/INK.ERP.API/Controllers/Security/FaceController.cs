using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using INK.ERP.Application.Features.Security.Face;
using INK.ERP.Application.Features.Security.Face.DTOs;

namespace INK.ERP.API.Controllers.Security;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/security/face")]
[EnableRateLimiting("FacePolicy")]
public class FaceController : BaseApiController
{
    private static readonly string[] AllowedMimeTypes = { "image/jpeg", "image/jpg", "image/png" };
    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

    /// <summary>
    /// Enrolls a user's facial biometric template using multipart image upload.
    /// </summary>
    [HttpPost("enroll")]
    [Authorize(Policy = "Security.Face.Enroll")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Enroll([FromForm] EnrollFaceRequest request, CancellationToken cancellationToken)
    {
        var validationError = ValidateImageFile(request.Image);
        if (validationError != null) return validationError;

        using var ms = new MemoryStream();
        await request.Image.CopyToAsync(ms, cancellationToken);
        var imageBytes = ms.ToArray();

        var command = new EnrollFaceCommand(request.UserId, imageBytes, request.AlgorithmVersion ?? "v1.0");
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Records a face verification attempt against the user's enrolled biometric template.
    /// </summary>
    [HttpPost("verify")]
    [Authorize(Policy = "Security.Face.Verify")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Verify([FromBody] RecordFaceVerificationCommand command, CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Replaces an existing face template with a newly captured facial image.
    /// </summary>
    [HttpPut("template")]
    [Authorize(Policy = "Security.Face.Enroll")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ReplaceTemplate([FromForm] ReplaceFaceTemplateRequest request, CancellationToken cancellationToken)
    {
        var validationError = ValidateImageFile(request.Image);
        if (validationError != null) return validationError;

        using var ms = new MemoryStream();
        await request.Image.CopyToAsync(ms, cancellationToken);
        var imageBytes = ms.ToArray();

        var command = new ReplaceFaceTemplateCommand(request.UserId, imageBytes);
        var result = await Mediator.Send(command, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Deactivates a user's face profile or archives a specific template version.
    /// </summary>
    [HttpDelete("template")]
    [Authorize(Policy = "Security.Face.Enroll")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteTemplate([FromQuery] Guid userId, [FromQuery] int? version, CancellationToken cancellationToken)
    {
        if (version.HasValue)
        {
            var archiveCommand = new ArchiveFaceTemplateCommand(userId, version.Value);
            var archiveResult = await Mediator.Send(archiveCommand, cancellationToken);
            return HandleResult(archiveResult);
        }

        var deactivateCommand = new DeactivateFaceProfileCommand(userId);
        var deactivateResult = await Mediator.Send(deactivateCommand, cancellationToken);
        return HandleResult(deactivateResult);
    }

    /// <summary>
    /// Retrieves a user's face profile metadata and active template version.
    /// </summary>
    [HttpGet("profile")]
    [Authorize(Policy = "Security.Face.Verify")]
    [ProducesResponseType(typeof(FaceProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfile([FromQuery] Guid userId, CancellationToken cancellationToken)
    {
        var query = new GetFaceProfileQuery(userId);
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Retrieves face verification attempt logs for a user.
    /// </summary>
    [HttpGet("history")]
    [Authorize(Policy = "Security.Face.Verify")]
    [ProducesResponseType(typeof(IReadOnlyList<FaceVerificationDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHistory([FromQuery] Guid userId, CancellationToken cancellationToken)
    {
        var query = new GetFaceVerificationHistoryQuery(userId);
        var result = await Mediator.Send(query, cancellationToken);
        return HandleResult(result);
    }

    private IActionResult? ValidateImageFile(IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid File Payload",
                Detail = "Facial image file is required.",
                Instance = HttpContext.Request.Path
            });
        }

        if (file.Length > MaxFileSizeBytes)
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "File Size Exceeded",
                Detail = $"File size ({file.Length / (1024 * 1024)} MB) exceeds maximum allowed limit (5 MB).",
                Instance = HttpContext.Request.Path
            });
        }

        if (!AllowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
        {
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid Image MIME Type",
                Detail = $"ContentType '{file.ContentType}' is not allowed. Only JPG, JPEG, and PNG images are accepted.",
                Instance = HttpContext.Request.Path
            });
        }

        return null;
    }
}

public sealed record EnrollFaceRequest(Guid UserId, IFormFile Image, string? AlgorithmVersion = "v1.0");
public sealed record ReplaceFaceTemplateRequest(Guid UserId, IFormFile Image);
