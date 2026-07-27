using FluentValidation;

namespace INK.ERP.Application.Features.Security.Face.Validators;

public sealed class EnrollFaceCommandValidator : AbstractValidator<EnrollFaceCommand>
{
    public EnrollFaceCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.ImageData).NotEmpty().WithMessage("Face image data is required.");
    }
}

public sealed class ReplaceFaceTemplateCommandValidator : AbstractValidator<ReplaceFaceTemplateCommand>
{
    public ReplaceFaceTemplateCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.ImageData).NotEmpty().WithMessage("Replacement face image data is required.");
    }
}

public sealed class RecordFaceVerificationCommandValidator : AbstractValidator<RecordFaceVerificationCommand>
{
    public RecordFaceVerificationCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.MatchScore).InclusiveBetween(0.0f, 1.0f);
    }
}
