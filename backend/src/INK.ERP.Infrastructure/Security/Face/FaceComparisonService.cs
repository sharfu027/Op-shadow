using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using INK.ERP.Infrastructure.Options;

namespace INK.ERP.Infrastructure.Security.Face;

public sealed class FaceComparisonService : IFaceComparisonService
{
    private readonly IFaceComparisonStrategy _strategy;
    private readonly FaceRecognitionOptions _options;
    private readonly ILogger<FaceComparisonService> _logger;

    public FaceComparisonService(
        IFaceComparisonStrategy strategy,
        IOptions<FaceRecognitionOptions> options,
        ILogger<FaceComparisonService> logger)
    {
        _strategy = strategy;
        _options = options.Value;
        _logger = logger;
    }

    public FaceComparisonResult Compare(float[] vectorA, float[] vectorB)
    {
        var result = _strategy.Compare(vectorA, vectorB, _options.MatchThreshold);
        _logger.LogDebug("Comparison using strategy '{Strategy}' evaluated score: {Score:F4}, Match: {IsMatch}", _strategy.StrategyName, result.SimilarityScore, result.IsMatch);
        return result;
    }

    public FaceComparisonResult Compare(string vectorDataA, string vectorDataB)
    {
        var floatsA = ParseVector(vectorDataA);
        var floatsB = ParseVector(vectorDataB);

        return Compare(floatsA, floatsB);
    }

    private static float[] ParseVector(string vectorData)
    {
        if (string.IsNullOrWhiteSpace(vectorData)) return Array.Empty<float>();
        var parts = vectorData.Split(new[] { ',', ' ' }, StringSplitOptions.RemoveEmptyEntries);
        var result = new float[parts.Length];
        for (int i = 0; i < parts.Length; i++)
        {
            float.TryParse(parts[i], out result[i]);
        }
        return result;
    }
}
