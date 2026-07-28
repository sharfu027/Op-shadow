using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using INK.ERP.Infrastructure.Options;

namespace INK.ERP.Infrastructure.Security.Face;

public interface IFaceComparisonService
{
    FaceComparisonResult Compare(float[] vectorA, float[] vectorB);
    FaceComparisonResult Compare(string vectorDataA, string vectorDataB);
}

public sealed record FaceComparisonResult(
    float SimilarityScore,
    bool IsMatch,
    float ConfidenceScore,
    double EuclideanDistance);

public sealed class FaceComparisonService : IFaceComparisonService
{
    private readonly FaceRecognitionOptions _options;
    private readonly ILogger<FaceComparisonService> _logger;

    public FaceComparisonService(IOptions<FaceRecognitionOptions> options, ILogger<FaceComparisonService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public FaceComparisonResult Compare(float[] vectorA, float[] vectorB)
    {
        if (vectorA == null || vectorB == null || vectorA.Length == 0 || vectorA.Length != vectorB.Length)
        {
            return new FaceComparisonResult(0.0f, false, 0.0f, double.MaxValue);
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        double sumSquareDiff = 0.0;

        for (int i = 0; i < vectorA.Length; i++)
        {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
            double diff = vectorA[i] - vectorB[i];
            sumSquareDiff += diff * diff;
        }

        double denominator = Math.Sqrt(normA) * Math.Sqrt(normB);
        float similarity = denominator > 0 ? (float)(dotProduct / denominator) : 0.0f;
        double euclideanDistance = Math.Sqrt(sumSquareDiff);

        bool isMatch = similarity >= _options.MatchThreshold;
        float confidence = Math.Max(0.0f, Math.Min(1.0f, similarity));

        _logger.LogDebug("Cosine Similarity evaluated: {Similarity:F4}, Match: {IsMatch}", similarity, isMatch);

        return new FaceComparisonResult(similarity, isMatch, confidence, euclideanDistance);
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
