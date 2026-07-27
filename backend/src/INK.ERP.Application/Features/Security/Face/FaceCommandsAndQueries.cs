using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.Entities.Security;
using INK.ERP.Domain.ValueObjects.Security;
using INK.ERP.Application.Features.Security.Face.DTOs;

namespace INK.ERP.Application.Features.Security.Face;

// ----------------------------------------------------
// 1. EnrollFaceCommand
// ----------------------------------------------------
public sealed record EnrollFaceCommand(
    Guid UserId,
    byte[] ImageData,
    string AlgorithmVersion = "v1.0") : ICommand<Result<Guid>>;

public sealed class EnrollFaceCommandHandler : IRequestHandler<EnrollFaceCommand, Result<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFaceEmbeddingService _embeddingService;
    private readonly IImageQualityService _qualityService;
    private readonly ILivenessDetectionService _livenessService;
    private readonly ILogger<EnrollFaceCommandHandler> _logger;

    public EnrollFaceCommandHandler(
        IUnitOfWork unitOfWork,
        IFaceEmbeddingService embeddingService,
        IImageQualityService qualityService,
        ILivenessDetectionService livenessService,
        ILogger<EnrollFaceCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _embeddingService = embeddingService;
        _qualityService = qualityService;
        _livenessService = livenessService;
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(EnrollFaceCommand request, CancellationToken cancellationToken)
    {
        var livenessResult = await _livenessService.DetectLivenessAsync(request.ImageData, cancellationToken);
        if (livenessResult.IsFailure || !livenessResult.Value)
        {
            return Result.Failure<Guid>(SecurityErrors.Face.LivenessCheckFailed);
        }

        var qualityResult = await _qualityService.ValidateQualityAsync(request.ImageData, cancellationToken);
        if (qualityResult.IsFailure || qualityResult.Value < 0.70f)
        {
            return Result.Failure<Guid>(SecurityErrors.Face.QualityCheckFailed("Score below 0.70 threshold."));
        }

        var embeddingResult = await _embeddingService.GenerateEmbeddingAsync(request.ImageData, cancellationToken);
        if (embeddingResult.IsFailure)
        {
            return Result.Failure<Guid>(embeddingResult.Error);
        }

        var faceProfileRepo = _unitOfWork.Repository<FaceProfile>();
        var profiles = await faceProfileRepo.FindAsync(p => p.UserId == request.UserId && !p.IsDeleted, cancellationToken);
        var profile = profiles.FirstOrDefault();

        if (profile == null)
        {
            profile = new FaceProfile(request.UserId);
            await faceProfileRepo.AddAsync(profile, cancellationToken);
        }

        try
        {
            profile.Enroll(embeddingResult.Value);
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<Guid>(new Error("SECURITY.FACE.ENROLLMENT_FAILED", ex.Message, ErrorType.Conflict));
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Enrolled face profile for user {UserId}", request.UserId);

        return Result.Success(profile.Id);
    }
}

public sealed class EnrollFaceCommandValidator : AbstractValidator<EnrollFaceCommand>
{
    public EnrollFaceCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.ImageData).NotEmpty().WithMessage("Image data is required.");
    }
}

// ----------------------------------------------------
// 2. ReplaceFaceTemplateCommand
// ----------------------------------------------------
public sealed record ReplaceFaceTemplateCommand(Guid UserId, byte[] ImageData) : ICommand<Result<Unit>>;

public sealed class ReplaceFaceTemplateCommandHandler : IRequestHandler<ReplaceFaceTemplateCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFaceEmbeddingService _embeddingService;
    private readonly IImageQualityService _qualityService;

    public ReplaceFaceTemplateCommandHandler(IUnitOfWork unitOfWork, IFaceEmbeddingService embeddingService, IImageQualityService qualityService)
    {
        _unitOfWork = unitOfWork;
        _embeddingService = embeddingService;
        _qualityService = qualityService;
    }

    public async Task<Result<Unit>> Handle(ReplaceFaceTemplateCommand request, CancellationToken cancellationToken)
    {
        var qualityResult = await _qualityService.ValidateQualityAsync(request.ImageData, cancellationToken);
        if (qualityResult.IsFailure || qualityResult.Value < 0.70f)
        {
            return Result.Failure<Unit>(SecurityErrors.Face.QualityCheckFailed("Image quality is insufficient."));
        }

        var embeddingResult = await _embeddingService.GenerateEmbeddingAsync(request.ImageData, cancellationToken);
        if (embeddingResult.IsFailure)
        {
            return Result.Failure<Unit>(embeddingResult.Error);
        }

        var faceProfileRepo = _unitOfWork.Repository<FaceProfile>();
        var profiles = await faceProfileRepo.FindAsync(p => p.UserId == request.UserId && !p.IsDeleted, cancellationToken);
        var profile = profiles.FirstOrDefault();

        if (profile == null)
        {
            return Result.Failure<Unit>(SecurityErrors.Face.ProfileNotFound(request.UserId));
        }

        try
        {
            profile.ReplaceTemplate(embeddingResult.Value);
            faceProfileRepo.Update(profile);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(Unit.Value);
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<Unit>(new Error("SECURITY.FACE.REPLACE_FAILED", ex.Message, ErrorType.Conflict));
        }
    }
}

public sealed class ReplaceFaceTemplateCommandValidator : AbstractValidator<ReplaceFaceTemplateCommand>
{
    public ReplaceFaceTemplateCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.ImageData).NotEmpty();
    }
}

// ----------------------------------------------------
// 3. DeactivateFaceProfileCommand & ReactivateFaceProfileCommand
// ----------------------------------------------------
public sealed record DeactivateFaceProfileCommand(Guid UserId) : ICommand<Result<Unit>>;

public sealed class DeactivateFaceProfileCommandHandler : IRequestHandler<DeactivateFaceProfileCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeactivateFaceProfileCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(DeactivateFaceProfileCommand request, CancellationToken cancellationToken)
    {
        var faceProfileRepo = _unitOfWork.Repository<FaceProfile>();
        var profiles = await faceProfileRepo.FindAsync(p => p.UserId == request.UserId && !p.IsDeleted, cancellationToken);
        var profile = profiles.FirstOrDefault();

        if (profile == null)
        {
            return Result.Failure<Unit>(SecurityErrors.Face.ProfileNotFound(request.UserId));
        }

        profile.Deactivate();
        faceProfileRepo.Update(profile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(Unit.Value);
    }
}

public sealed record ReactivateFaceProfileCommand(Guid UserId) : ICommand<Result<Unit>>;

public sealed class ReactivateFaceProfileCommandHandler : IRequestHandler<ReactivateFaceProfileCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public ReactivateFaceProfileCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(ReactivateFaceProfileCommand request, CancellationToken cancellationToken)
    {
        var faceProfileRepo = _unitOfWork.Repository<FaceProfile>();
        var profiles = await faceProfileRepo.FindAsync(p => p.UserId == request.UserId && !p.IsDeleted, cancellationToken);
        var profile = profiles.FirstOrDefault();

        if (profile == null)
        {
            return Result.Failure<Unit>(SecurityErrors.Face.ProfileNotFound(request.UserId));
        }

        profile.Reactivate();
        faceProfileRepo.Update(profile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(Unit.Value);
    }
}

// ----------------------------------------------------
// 4. RecordFaceVerificationCommand & ArchiveFaceTemplateCommand
// ----------------------------------------------------
public sealed record RecordFaceVerificationCommand(
    Guid UserId,
    float MatchScore,
    bool IsSuccess,
    string? DeviceId = null,
    string? FailureReason = null) : ICommand<Result<Unit>>;

public sealed class RecordFaceVerificationCommandHandler : IRequestHandler<RecordFaceVerificationCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public RecordFaceVerificationCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(RecordFaceVerificationCommand request, CancellationToken cancellationToken)
    {
        var faceProfileRepo = _unitOfWork.Repository<FaceProfile>();
        var profiles = await faceProfileRepo.FindAsync(p => p.UserId == request.UserId && !p.IsDeleted, cancellationToken);
        var profile = profiles.FirstOrDefault();

        if (profile == null)
        {
            return Result.Failure<Unit>(SecurityErrors.Face.ProfileNotFound(request.UserId));
        }

        try
        {
            profile.RecordVerification(request.MatchScore, request.IsSuccess, request.DeviceId, request.FailureReason);
            faceProfileRepo.Update(profile);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(Unit.Value);
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure<Unit>(new Error("SECURITY.FACE.VERIFICATION_FAILED", ex.Message, ErrorType.Conflict));
        }
    }
}

public sealed record ArchiveFaceTemplateCommand(Guid UserId, int Version) : ICommand<Result<Unit>>;

public sealed class ArchiveFaceTemplateCommandHandler : IRequestHandler<ArchiveFaceTemplateCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public ArchiveFaceTemplateCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(ArchiveFaceTemplateCommand request, CancellationToken cancellationToken)
    {
        var faceProfileRepo = _unitOfWork.Repository<FaceProfile>();
        var profiles = await faceProfileRepo.FindAsync(p => p.UserId == request.UserId && !p.IsDeleted, cancellationToken);
        var profile = profiles.FirstOrDefault();

        if (profile == null)
        {
            return Result.Failure<Unit>(SecurityErrors.Face.ProfileNotFound(request.UserId));
        }

        profile.ArchiveTemplate(request.Version);
        faceProfileRepo.Update(profile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(Unit.Value);
    }
}

// ----------------------------------------------------
// 5. Face Queries
// ----------------------------------------------------
public sealed record GetFaceProfileQuery(Guid UserId) : IQuery<Result<FaceProfileDto>>;

public sealed class GetFaceProfileQueryHandler : IRequestHandler<GetFaceProfileQuery, Result<FaceProfileDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetFaceProfileQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<FaceProfileDto>> Handle(GetFaceProfileQuery request, CancellationToken cancellationToken)
    {
        var faceProfileRepo = _unitOfWork.Repository<FaceProfile>();
        var profiles = await faceProfileRepo.FindAsync(p => p.UserId == request.UserId && !p.IsDeleted, cancellationToken);
        var profile = profiles.FirstOrDefault();

        if (profile == null)
        {
            return Result.Failure<FaceProfileDto>(SecurityErrors.Face.ProfileNotFound(request.UserId));
        }

        var templatesDto = profile.Templates.Select(t => new FaceTemplateDto(
            t.Id, t.Version, t.AlgorithmVersion, t.QualityScore, t.IsActive, t.CreatedAtUtc)).ToList();

        var profileDto = new FaceProfileDto(
            profile.Id, profile.UserId, profile.Status.ToString(), profile.IsActive, profile.ActiveTemplateVersion, templatesDto);

        return Result.Success(profileDto);
    }
}

public sealed record GetFaceVerificationHistoryQuery(Guid UserId) : IQuery<Result<IReadOnlyList<FaceVerificationDto>>>;

public sealed class GetFaceVerificationHistoryQueryHandler : IRequestHandler<GetFaceVerificationHistoryQuery, Result<IReadOnlyList<FaceVerificationDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetFaceVerificationHistoryQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<FaceVerificationDto>>> Handle(GetFaceVerificationHistoryQuery request, CancellationToken cancellationToken)
    {
        var faceProfileRepo = _unitOfWork.Repository<FaceProfile>();
        var profiles = await faceProfileRepo.FindAsync(p => p.UserId == request.UserId && !p.IsDeleted, cancellationToken);
        var profile = profiles.FirstOrDefault();

        if (profile == null)
        {
            return Result.Failure<IReadOnlyList<FaceVerificationDto>>(SecurityErrors.Face.ProfileNotFound(request.UserId));
        }

        var logs = profile.VerificationLogs.Select(v => new FaceVerificationDto(
            v.Id, v.MatchScore, v.IsSuccessful, v.DeviceId, v.FailureReason, v.CreatedAtUtc)).ToList();

        return Result.Success<IReadOnlyList<FaceVerificationDto>>(logs);
    }
}

public sealed record GetEnrollmentHistoryQuery(Guid UserId) : IQuery<Result<IReadOnlyList<EnrollmentHistoryDto>>>;

public sealed class GetEnrollmentHistoryQueryHandler : IRequestHandler<GetEnrollmentHistoryQuery, Result<IReadOnlyList<EnrollmentHistoryDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetEnrollmentHistoryQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<EnrollmentHistoryDto>>> Handle(GetEnrollmentHistoryQuery request, CancellationToken cancellationToken)
    {
        var faceProfileRepo = _unitOfWork.Repository<FaceProfile>();
        var profiles = await faceProfileRepo.FindAsync(p => p.UserId == request.UserId && !p.IsDeleted, cancellationToken);
        var profile = profiles.FirstOrDefault();

        if (profile == null)
        {
            return Result.Failure<IReadOnlyList<EnrollmentHistoryDto>>(SecurityErrors.Face.ProfileNotFound(request.UserId));
        }

        var logs = profile.EnrollmentLogs.Select(e => new EnrollmentHistoryDto(
            e.Id, e.TemplateVersion, e.Status.ToString(), e.Notes, e.CreatedAtUtc)).ToList();

        return Result.Success<IReadOnlyList<EnrollmentHistoryDto>>(logs);
    }
}
