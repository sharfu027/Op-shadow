using FluentValidation;

namespace INK.ERP.Application.Features.Security.Device.Validators;

public sealed class ApproveDeviceCommandValidator : AbstractValidator<ApproveDeviceCommand>
{
    public ApproveDeviceCommandValidator()
    {
        RuleFor(x => x.DeviceId).NotEmpty();
        RuleFor(x => x.ApprovedBy).NotEmpty().WithMessage("Approver identification is required.");
    }
}

public sealed class RejectDeviceCommandValidator : AbstractValidator<RejectDeviceCommand>
{
    public RejectDeviceCommandValidator()
    {
        RuleFor(x => x.DeviceId).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().WithMessage("Rejection reason is required.");
    }
}

public sealed class TrustDeviceCommandValidator : AbstractValidator<TrustDeviceCommand>
{
    public TrustDeviceCommandValidator()
    {
        RuleFor(x => x.DeviceId).NotEmpty();
    }
}

public sealed class RevokeDeviceCommandValidator : AbstractValidator<RevokeDeviceCommand>
{
    public RevokeDeviceCommandValidator()
    {
        RuleFor(x => x.DeviceId).NotEmpty();
        RuleFor(x => x.Reason).NotEmpty().WithMessage("Revocation reason is required.");
    }
}

public sealed class HeartbeatCommandValidator : AbstractValidator<HeartbeatCommand>
{
    public HeartbeatCommandValidator()
    {
        RuleFor(x => x.DeviceId).NotEmpty();
        RuleFor(x => x.IpAddress).NotEmpty().WithMessage("IP Address is required.");
    }
}
