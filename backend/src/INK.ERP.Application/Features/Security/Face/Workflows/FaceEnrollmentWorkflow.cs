using Microsoft.Extensions.Logging;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.Entities.Security;
using INK.ERP.Application.Features.Security.Face.DTOs;

namespace INK.ERP.Application.Features.Security.Face.Workflows;

public interface IFaceEnrollmentWorkflow
{
    Task<Result<FaceProfileDto>> ExecuteAsync(EnrollFaceCommand command, CancellationToken cancellationToken = default);
}

public class FaceEnrollmentWorkflow : IFaceEnrollmentWorkflow
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFaceEmbeddingService _embeddingService;
    private readonly IImageQualityService _qualityService;
    private readonly ILivenessDetectionService _livenessService;
    private readonly ILogger<FaceEnrollmentWorkflow> _logger;

    public FaceEnrollmentWorkflow(
        IUnitOfWork unitOfWork,
        IFaceEmbeddingService embeddingService,
        IImageQualityService qualityService,
        ILivenessDetectionService livenessService,
        ILogger<FaceEnrollmentWorkflow> logger)
    {
        _unitOfWork = unitOfWork;
        _embeddingService = embeddingService;
        _qualityService = qualityService;
        _livenessService = livenessService;
        _logger = logger;
    }

    public async Task<Result<FaceProfileDto>> ExecuteAsync(EnrollFaceCommand command, CancellationToken cancellationToken = default)
    {
        if (command == null || command.ImageData == null || command.ImageData.Length == 0)
        {
            return Result.Failure<FaceProfileDto>(SecurityErrors.Face.QualityCheckFailed("Image data is empty."));
        }

        var livenessResult = await _livenessService.DetectLivenessAsync(command.ImageData, cancellationToken);
        if (livenessResult.IsFailure || !livenessResult.Value)
        {
            return Result.Failure<FaceProfileDto>(SecurityErrors.Face.LivenessCheckFailed);
        }

        var qualityResult = await _qualityService.ValidateQualityAsync(command.ImageData, cancellationToken);
        if (qualityResult.IsFailure || qualityResult.Value < 0.70f)
        {
            return Result.Failure<FaceProfileDto>(SecurityErrors.Face.QualityCheckFailed("Score below 0.70 threshold."));
        }

        var embeddingResult = await _embeddingService.GenerateEmbeddingAsync(command.ImageData, cancellationToken);
        if (embeddingResult.IsFailure)
        {
            return Result.Failure<FaceProfileDto>(embeddingResult.Error);
        }

        var faceProfileRepo = _unitOfWork.Repository<FaceProfile>();
        var profiles = await faceProfileRepo.FindAsync(p => p.UserId == command.UserId && !p.IsDeleted, cancellationToken);
        var profile = profiles.FirstOrDefault();

        if (profile == null)
        {
            profile = new FaceProfile(command.UserId);
            await faceProfileRepo.AddAsync(profile, cancellationToken);
        }

        try
        {
            profile.Enroll(embeddingResult.Value.Embedding);
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<FaceProfileDto>(new Error("SECURITY.FACE.ENROLLMENT_FAILED", ex.Message, ErrorType.Conflict));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Workflow enrolled face profile for user {UserId}", command.UserId);

        var templatesDto = profile.Templates.Select(t => new FaceTemplateDto(
            t.Id, t.Version, t.AlgorithmVersion, t.QualityScore, t.IsActive, t.CreatedAtUtc)).ToList();

        var profileDto = new FaceProfileDto(
            profile.Id, profile.UserId, profile.Status.ToString(), profile.IsActive, profile.ActiveTemplateVersion, templatesDto);

        return Result.Success(profileDto);
    }
}
