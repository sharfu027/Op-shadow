using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Application.Features.Security.Common;
using INK.ERP.Application.Features.Security.Risk.DTOs;
using INK.ERP.Domain.Common;
using INK.ERP.Infrastructure.Options;

namespace INK.ERP.Infrastructure.Security.Risk;

public interface IRiskEvaluationStrategy
{
    int Evaluate(AuthenticationContext context, List<string> reasons, List<string> triggeredPolicies, List<string> recommendedActions);
}

public sealed class FaceRiskStrategy : IRiskEvaluationStrategy
{
    public int Evaluate(AuthenticationContext context, List<string> reasons, List<string> triggeredPolicies, List<string> recommendedActions)
    {
        if (context.SecurityPolicySnapshot != null && context.SecurityPolicySnapshot.FaceMode == "StrictMatching")
        {
            triggeredPolicies.Add("Policy: Strict Face Matching Required");
        }
        return 0;
    }
}

public sealed class GpsRiskStrategy : IRiskEvaluationStrategy
{
    public int Evaluate(AuthenticationContext context, List<string> reasons, List<string> triggeredPolicies, List<string> recommendedActions)
    {
        int score = 0;
        if (context.GpsAccuracy != null && context.GpsAccuracy.AccuracyInMeters > 100.0)
        {
            score += 20;
            reasons.Add("GPS accuracy is poor (>100m).");
            recommendedActions.Add("Request high-precision GPS refresh.");
        }
        return score;
    }
}

public sealed class DeviceRiskStrategy : IRiskEvaluationStrategy
{
    public int Evaluate(AuthenticationContext context, List<string> reasons, List<string> triggeredPolicies, List<string> recommendedActions)
    {
        int score = 0;
        if (context.DeviceId == null)
        {
            score += 30;
            reasons.Add("Unregistered hardware device.");
            recommendedActions.Add("Prompt user to complete device registration.");
        }
        return score;
    }
}

public sealed class RiskEngine : IRiskEngine
{
    private readonly SecurityRiskOptions _options;
    private readonly IEnumerable<IRiskEvaluationStrategy> _strategies;
    private readonly ILogger<RiskEngine> _logger;

    public RiskEngine(
        IOptions<SecurityRiskOptions> options,
        IEnumerable<IRiskEvaluationStrategy> strategies,
        ILogger<RiskEngine> logger)
    {
        _options = options.Value;
        _strategies = strategies;
        _logger = logger;
    }

    public Task<Result<RiskAssessmentDto>> AssessRiskAsync(AuthenticationContext context, CancellationToken cancellationToken = default)
    {
        if (context == null)
        {
            return Task.FromResult(Result.Failure<RiskAssessmentDto>(new Error("SECURITY.RISK.INVALID_CONTEXT", "Authentication context is required.", ErrorType.Validation)));
        }

        var reasons = new List<string>();
        var triggeredPolicies = new List<string>();
        var recommendedActions = new List<string>();

        int totalScore = 0;
        foreach (var strategy in _strategies)
        {
            totalScore += strategy.Evaluate(context, reasons, triggeredPolicies, recommendedActions);
        }

        totalScore = Math.Min(totalScore, 100);

        var level = totalScore switch
        {
            >= 90 => "Critical",
            >= 75 => "High",
            >= 30 => "Medium",
            _ => "Low"
        };

        if (totalScore >= _options.HighRiskThreshold)
        {
            recommendedActions.Add("Enforce Step-Up Multi-Factor Authentication (MFA).");
        }

        _logger.LogInformation("Assessed Risk Score {Score}/100 [{Level}] for User {UserId}", totalScore, level, context.UserId);

        var dto = new RiskAssessmentDto(
            UserId: context.UserId,
            Score: totalScore,
            Level: level,
            Reasons: reasons,
            TriggeredPolicies: triggeredPolicies,
            RecommendedActions: recommendedActions,
            Confidence: 0.95f,
            CalculatedAtUtc: DateTime.UtcNow);

        return Task.FromResult(Result.Success(dto));
    }
}
