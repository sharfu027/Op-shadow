using Microsoft.Extensions.Logging;

namespace INK.ERP.Infrastructure.Security.Face;

public interface IImagePipelineStage
{
    string StageName { get; }
    Task<PreprocessedImageResult> ProcessAsync(PreprocessedImageResult context, CancellationToken cancellationToken = default);
}

public interface IImagePipeline
{
    Task<PreprocessedImageResult> ExecutePipelineAsync(byte[] rawImageData, CancellationToken cancellationToken = default);
}

public sealed class FaceDetectionStage : IImagePipelineStage
{
    public string StageName => "FaceDetection";

    public Task<PreprocessedImageResult> ProcessAsync(PreprocessedImageResult context, CancellationToken cancellationToken = default)
    {
        if (context.RawBytes == null || context.RawBytes.Length < 100)
        {
            return Task.FromResult(context with { IsSuccess = false, DetectedFaceCount = 0, ErrorMessage = "Invalid image buffer." });
        }
        return Task.FromResult(context with { DetectedFaceCount = 1 });
    }
}

public sealed class FaceAlignmentStage : IImagePipelineStage
{
    public string StageName => "FaceAlignment";

    public Task<PreprocessedImageResult> ProcessAsync(PreprocessedImageResult context, CancellationToken cancellationToken = default)
    {
        if (!context.IsSuccess) return Task.FromResult(context);
        return Task.FromResult(context);
    }
}

public sealed class ImageNormalizationStage : IImagePipelineStage
{
    public string StageName => "ImageNormalization";

    public Task<PreprocessedImageResult> ProcessAsync(PreprocessedImageResult context, CancellationToken cancellationToken = default)
    {
        if (!context.IsSuccess) return Task.FromResult(context);
        return Task.FromResult(context with { BrightnessLevel = 0.55f });
    }
}

public sealed class ImageQualityCheckStage : IImagePipelineStage
{
    public string StageName => "ImageQualityCheck";

    public Task<PreprocessedImageResult> ProcessAsync(PreprocessedImageResult context, CancellationToken cancellationToken = default)
    {
        if (!context.IsSuccess) return Task.FromResult(context);
        return Task.FromResult(context with { BlurScore = 88.0f });
    }
}

public sealed class ImagePipeline : IImagePipeline
{
    private readonly IEnumerable<IImagePipelineStage> _stages;
    private readonly ILogger<ImagePipeline> _logger;

    public ImagePipeline(IEnumerable<IImagePipelineStage> stages, ILogger<ImagePipeline> logger)
    {
        _stages = stages;
        _logger = logger;
    }

    public async Task<PreprocessedImageResult> ExecutePipelineAsync(byte[] rawImageData, CancellationToken cancellationToken = default)
    {
        var context = new PreprocessedImageResult(true, rawImageData, rawImageData, 0, 0.0f, 0.0f, null);

        foreach (var stage in _stages)
        {
            _logger.LogDebug("Executing pipeline stage '{Stage}'", stage.StageName);
            context = await stage.ProcessAsync(context, cancellationToken);
            if (!context.IsSuccess)
            {
                _logger.LogWarning("Pipeline stage '{Stage}' failed: {Error}", stage.StageName, context.ErrorMessage);
                break;
            }
        }

        return context;
    }
}
