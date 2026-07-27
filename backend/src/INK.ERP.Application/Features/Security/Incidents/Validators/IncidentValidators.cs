using FluentValidation;

namespace INK.ERP.Application.Features.Security.Incidents.Validators;

public sealed class RaiseSecurityIncidentCommandValidator : AbstractValidator<RaiseSecurityIncidentCommand>
{
    public RaiseSecurityIncidentCommandValidator()
    {
        RuleFor(x => x.Description).NotEmpty().WithMessage("Incident description is required.");
    }
}

public sealed class ResolveSecurityIncidentCommandValidator : AbstractValidator<ResolveSecurityIncidentCommand>
{
    public ResolveSecurityIncidentCommandValidator()
    {
        RuleFor(x => x.IncidentId).NotEmpty();
        RuleFor(x => x.ResolutionNotes).NotEmpty().WithMessage("Resolution notes are required.");
    }
}
