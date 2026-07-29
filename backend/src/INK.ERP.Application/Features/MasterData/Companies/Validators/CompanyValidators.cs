using FluentValidation;
using INK.ERP.Application.Features.MasterData.Companies.Commands;

namespace INK.ERP.Application.Features.MasterData.Companies.Validators;

public class CreateCompanyCommandValidator : AbstractValidator<CreateCompanyCommand>
{
    public CreateCompanyCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Company Code is required.")
            .MaximumLength(20).WithMessage("Company Code cannot exceed 20 characters.");

        RuleFor(x => x.LegalName)
            .NotEmpty().WithMessage("Legal Name is required.")
            .MaximumLength(150).WithMessage("Legal Name cannot exceed 150 characters.");

        RuleFor(x => x.TaxRegistrationNumber)
            .NotEmpty().WithMessage("Tax Registration Number is required.")
            .MaximumLength(30).WithMessage("Tax Registration Number cannot exceed 30 characters.");

        RuleFor(x => x.PanNumber)
            .NotEmpty().WithMessage("PAN Number is required.")
            .Length(10).WithMessage("PAN Number must be exactly 10 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone number is required.");
    }
}

public class UpdateCompanyCommandValidator : AbstractValidator<UpdateCompanyCommand>
{
    public UpdateCompanyCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Company ID is required.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Company Code is required.")
            .MaximumLength(20).WithMessage("Company Code cannot exceed 20 characters.");

        RuleFor(x => x.LegalName)
            .NotEmpty().WithMessage("Legal Name is required.")
            .MaximumLength(150).WithMessage("Legal Name cannot exceed 150 characters.");

        RuleFor(x => x.TaxRegistrationNumber)
            .NotEmpty().WithMessage("Tax Registration Number is required.")
            .MaximumLength(30).WithMessage("Tax Registration Number cannot exceed 30 characters.");

        RuleFor(x => x.PanNumber)
            .NotEmpty().WithMessage("PAN Number is required.")
            .Length(10).WithMessage("PAN Number must be exactly 10 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone number is required.");
    }
}
