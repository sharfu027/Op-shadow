using FluentValidation;

namespace INK.ERP.Application.Features.Security.Policies.Validators;

public sealed class UpdateGlobalSecurityPolicyCommandValidator : AbstractValidator<UpdateGlobalSecurityPolicyCommand>
{
    public UpdateGlobalSecurityPolicyCommandValidator()
    {
        RuleFor(x => x.PolicyId).NotEmpty();
        RuleFor(x => x.MinFaceConfidenceScore).InclusiveBetween(0.0f, 1.0f);
        RuleFor(x => x.MaxAllowedGpsRadiusMeters).GreaterThanOrEqualTo(0.0);
        RuleFor(x => x.PasswordMinLength).GreaterThanOrEqualTo(6);
    }
}

public sealed class UpdateUserSecurityPolicyCommandValidator : AbstractValidator<UpdateUserSecurityPolicyCommand>
{
    public UpdateUserSecurityPolicyCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        When(x => x.MaxAllowedGpsRadiusMetersOverride.HasValue, () =>
        {
            RuleFor(x => x.MaxAllowedGpsRadiusMetersOverride!.Value).GreaterThanOrEqualTo(0.0);
        });
    }
}
