using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.Events.IAM;
using INK.ERP.Application.Features.IAM;

namespace INK.ERP.Application.Features.IAM.Commands.Users;

public sealed record CreateUserCommand(
    string Username,
    string Email,
    string? PhoneNumber,
    string FirstName,
    string LastName,
    string DisplayName,
    string Password,
    Guid? EmployeeId,
    string PreferredLanguage,
    string TimeZone) : ICommand<Result<Guid>>;

public sealed class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Result<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateUserCommandHandler> _logger;

    public CreateUserCommandHandler(IUnitOfWork unitOfWork, ILogger<CreateUserCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<ApplicationUser>();

        var existingUserByUsername = await userRepo.FindAsync(u => u.UserName == request.Username && !u.IsDeleted, cancellationToken);
        if (existingUserByUsername.Any())
        {
            return Result.Failure<Guid>(IamErrors.User.UsernameAlreadyExists(request.Username));
        }

        var existingUserByEmail = await userRepo.FindAsync(u => u.Email == request.Email && !u.IsDeleted, cancellationToken);
        if (existingUserByEmail.Any())
        {
            return Result.Failure<Guid>(IamErrors.User.EmailAlreadyExists(request.Email));
        }

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = request.Username,
            NormalizedUserName = request.Username.ToUpperInvariant(),
            Email = request.Email,
            NormalizedEmail = request.Email.ToUpperInvariant(),
            PhoneNumber = request.PhoneNumber,
            FirstName = request.FirstName,
            LastName = request.LastName,
            DisplayName = request.DisplayName,
            EmployeeId = request.EmployeeId,
            PreferredLanguage = string.IsNullOrWhiteSpace(request.PreferredLanguage) ? "en" : request.PreferredLanguage,
            TimeZone = string.IsNullOrWhiteSpace(request.TimeZone) ? "UTC" : request.TimeZone,
            PasswordHash = "HASHED:" + request.Password, // Placeholder logic without auth implementation
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        user.AddDomainEvent(new UserCreatedEvent(user.Id, user.UserName));

        await userRepo.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User Created: {UserId} ({Username})", user.Id, user.UserName);

        return Result.Success(user.Id);
    }
}

public sealed class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(50)
            .Matches(@"^[a-zA-Z0-9._-]+$");

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(200);

        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(150);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one digit.");

        RuleFor(x => x.PreferredLanguage).MaximumLength(10);
        RuleFor(x => x.TimeZone).MaximumLength(50);
    }
}
