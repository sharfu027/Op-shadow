using INK.ERP.Domain.Common;
using INK.ERP.Domain.ValueObjects.Security;

namespace INK.ERP.Application.Common.Interfaces;

public interface IFaceEmbeddingService
{
    Task<Result<FaceEmbedding>> GenerateEmbeddingAsync(byte[] imageData, CancellationToken cancellationToken = default);
}

public interface IImageQualityService
{
    Task<Result<float>> ValidateQualityAsync(byte[] imageData, CancellationToken cancellationToken = default);
}

public interface ILivenessDetectionService
{
    Task<Result<bool>> DetectLivenessAsync(byte[] imageData, CancellationToken cancellationToken = default);
}

public interface IGpsVerificationService
{
    Task<Result<bool>> ValidateGpsAsync(GpsCoordinate coordinate, GeoAccuracy accuracy, CancellationToken cancellationToken = default);
}

public interface IGeofenceService
{
    Task<Result<bool>> IsWithinGeofenceAsync(GpsCoordinate coordinate, double targetLat, double targetLon, double radiusMeters, CancellationToken cancellationToken = default);
}

public interface IDeviceFingerprintService
{
    Task<Result<DeviceFingerprint>> GenerateFingerprintAsync(string clientType, string deviceModel, string os, string rawData, CancellationToken cancellationToken = default);
}

public interface IRiskEngine
{
    Task<Result<INK.ERP.Application.Features.Security.Risk.DTOs.RiskAssessmentDto>> AssessRiskAsync(Guid userId, GpsCoordinate? currentCoordinate, string? ipAddress, CancellationToken cancellationToken = default);
}
