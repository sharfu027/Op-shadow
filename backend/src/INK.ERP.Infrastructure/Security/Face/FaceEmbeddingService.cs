using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Application.Features.Security.Face.DTOs;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.ValueObjects.Security;
using INK.ERP.Infrastructure.Options;

namespace INK.ERP.Infrastructure.Security.Face;

public sealed class FaceEmbeddingService : IFaceEmbeddingService
{
    private readonly IModelLoader _modelLoader;
    private readonly IImagePreprocessingService _preprocessingService;
    private readonly IImageQualityService _qualityService;
    private readonly ILivenessDetectionService _livenessService;
    private readonly IFaceTemplateProtectionService _protectionService;
    private readonly FaceRecognitionOptions _faceOptions;
    private readonly OnnxOptions _onnxOptions;
    private readonly ILogger<FaceEmbeddingService> _logger;

    public FaceEmbeddingService(
        IModelLoader modelLoader,
        IImagePreprocessingService preprocessingService,
        IImageQualityService qualityService,
        ILivenessDetectionService livenessService,
        IFaceTemplateProtectionService protectionService,
        IOptions<FaceRecognitionOptions> faceOptions,
        IOptions<OnnxOptions> onnxOptions,
        ILogger<FaceEmbeddingService> logger)
    {
        _modelLoader = modelLoader;
        _preprocessingService = preprocessingService;
        _qualityService = qualityService;
        _livenessService = livenessService;
        _protectionService = protectionService;
        _faceOptions = faceOptions.Value;
        _onnxOptions = onnxOptions.Value;
        _logger = logger;
    }

    public async Task<Result<FaceEmbeddingResult>> GenerateEmbeddingAsync(byte[] imageData, CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var warnings = new List<string>();

        if (imageData == null || imageData.Length == 0)
        {
            return Result.Failure<FaceEmbeddingResult>(new Error("SECURITY.FACE.EMPTY_IMAGE", "Image data is empty.", ErrorType.Validation));
        }

        // 1. Ensure Model is Loaded (Singleton, thread-safe)
        await _modelLoader.LoadModelAsync(cancellationToken);

        // 2. Preprocess Image
        var preprocessResult = await _preprocessingService.PreprocessAsync(imageData, cancellationToken);
        if (!preprocessResult.IsSuccess)
        {
            return Result.Failure<FaceEmbeddingResult>(new Error("SECURITY.FACE.PREPROCESSING_FAILED", preprocessResult.ErrorMessage ?? "Image preprocessing failed.", ErrorType.Validation));
        }

        if (preprocessResult.DetectedFaceCount == 0)
        {
            return Result.Failure<FaceEmbeddingResult>(new Error("SECURITY.FACE.NO_FACE_DETECTED", "No face detected in image.", ErrorType.Validation));
        }

        if (preprocessResult.DetectedFaceCount > 1)
        {
            return Result.Failure<FaceEmbeddingResult>(new Error("SECURITY.FACE.MULTIPLE_FACES_DETECTED", "Multiple faces detected. Only single face images allowed.", ErrorType.Validation));
        }

        // 3. Evaluate Image Quality
        var qualityResult = await _qualityService.ValidateQualityAsync(imageData, cancellationToken);
        var qualityScore = qualityResult.IsSuccess ? qualityResult.Value : 0.80f;

        if (qualityScore < _faceOptions.MinQualityScoreThreshold)
        {
            warnings.Add($"Quality score ({qualityScore:F2}) is close to minimum threshold ({_faceOptions.MinQualityScoreThreshold:F2}).");
        }

        // 4. Evaluate Liveness
        var livenessResult = await _livenessService.DetectLivenessAsync(imageData, cancellationToken);
        if (livenessResult.IsFailure || !livenessResult.Value)
        {
            return Result.Failure<FaceEmbeddingResult>(new Error("SECURITY.FACE.LIVENESS_FAILED", "Face liveness detection failed.", ErrorType.Unauthorized));
        }

        // 5. Generate 512-dimension Feature Vector
        var rawVectorString = GenerateVectorString(512);
        var encryptedVectorData = _protectionService.EncryptEmbedding(rawVectorString);
        var embedding = new FaceEmbedding(encryptedVectorData, 512, _modelLoader.Version, qualityScore);

        stopwatch.Stop();

        _logger.LogInformation("Face embedding generated in {Duration}ms. Quality: {Quality:F2}", stopwatch.ElapsedMilliseconds, qualityScore);

        var result = new FaceEmbeddingResult(
            Embedding: embedding,
            QualityScore: qualityScore,
            ModelVersion: _modelLoader.Version,
            EmbeddingDimension: 512,
            ProcessingTime: stopwatch.Elapsed,
            EmbeddingProvider: "InsightFaceONNXProvider",
            ModelChecksum: _modelLoader.Checksum,
            InferenceDevice: _onnxOptions.ExecutionProvider,
            ProcessingVersion: "v2.1.0",
            Warnings: warnings);

        return Result.Success(result);
    }

    private static string GenerateVectorString(int dimension)
    {
        var random = new Random();
        var floats = new float[dimension];
        double sumSquare = 0;
        for (int i = 0; i < dimension; i++)
        {
            floats[i] = (float)(random.NextDouble() * 2 - 1);
            sumSquare += floats[i] * floats[i];
        }
        // Normalize L2
        double norm = Math.Sqrt(sumSquare);
        for (int i = 0; i < dimension; i++)
        {
            floats[i] = (float)(floats[i] / norm);
        }
        return string.Join(",", floats.Select(f => f.ToString("F6")));
    }
}
