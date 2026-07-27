namespace INK.ERP.Application.Features.Security.Risk.DTOs;

public sealed record RiskAssessmentDto(
    Guid UserId,
    int Score,
    string Level,
    IReadOnlyList<string> Reasons,
    IReadOnlyList<string> TriggeredPolicies,
    IReadOnlyList<string> RecommendedActions,
    float Confidence,
    DateTime CalculatedAtUtc);
