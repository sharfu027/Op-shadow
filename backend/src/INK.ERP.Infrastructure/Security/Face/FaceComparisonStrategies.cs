namespace INK.ERP.Infrastructure.Security.Face;

public interface IFaceComparisonStrategy
{
    string StrategyName { get; }
    FaceComparisonResult Compare(float[] vectorA, float[] vectorB, float threshold);
}

public sealed class CosineStrategy : IFaceComparisonStrategy
{
    public string StrategyName => "CosineSimilarity";

    public FaceComparisonResult Compare(float[] vectorA, float[] vectorB, float threshold)
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

        bool isMatch = similarity >= threshold;
        float confidence = Math.Max(0.0f, Math.Min(1.0f, similarity));

        return new FaceComparisonResult(similarity, isMatch, confidence, euclideanDistance);
    }
}

public sealed class EuclideanStrategy : IFaceComparisonStrategy
{
    public string StrategyName => "EuclideanDistance";

    public FaceComparisonResult Compare(float[] vectorA, float[] vectorB, float threshold)
    {
        if (vectorA == null || vectorB == null || vectorA.Length == 0 || vectorA.Length != vectorB.Length)
        {
            return new FaceComparisonResult(0.0f, false, 0.0f, double.MaxValue);
        }

        double sumSquareDiff = 0.0;
        for (int i = 0; i < vectorA.Length; i++)
        {
            double diff = vectorA[i] - vectorB[i];
            sumSquareDiff += diff * diff;
        }

        double dist = Math.Sqrt(sumSquareDiff);
        float similarity = (float)Math.Max(0.0, 1.0 - (dist / 2.0));
        bool isMatch = similarity >= threshold;

        return new FaceComparisonResult(similarity, isMatch, similarity, dist);
    }
}

public sealed class HybridStrategy : IFaceComparisonStrategy
{
    private readonly CosineStrategy _cosine = new();
    private readonly EuclideanStrategy _euclidean = new();

    public string StrategyName => "HybridMetric";

    public FaceComparisonResult Compare(float[] vectorA, float[] vectorB, float threshold)
    {
        var cosineResult = _cosine.Compare(vectorA, vectorB, threshold);
        var euclideanResult = _euclidean.Compare(vectorA, vectorB, threshold);

        float hybridScore = (cosineResult.SimilarityScore * 0.7f) + (euclideanResult.SimilarityScore * 0.3f);
        bool isMatch = hybridScore >= threshold;

        return new FaceComparisonResult(hybridScore, isMatch, hybridScore, cosineResult.EuclideanDistance);
    }
}
