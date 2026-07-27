using INK.ERP.Domain.ValueObjects.Security;

namespace INK.ERP.Application.Features.Security.Face.DTOs;

public sealed record FaceEmbeddingResult(
    FaceEmbedding Embedding,
    float QualityScore,
    string ModelVersion,
    int EmbeddingDimension,
    TimeSpan ProcessingTime,
    IReadOnlyCollection<string> Warnings);
