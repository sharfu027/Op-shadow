using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.Entities.IAM;
using INK.ERP.Domain.Events.IAM;
using INK.ERP.Application.Features.IAM;

namespace INK.ERP.Application.Features.IAM.Commands.Users;

// ----------------------------------------------------
// 2. UpdateUserCommand
// ----------------------------------------------------
public sealed record UpdateUserCommand(
    Guid UserId,
    string FirstName,
    string LastName,
    string DisplayName,
    string? PhoneNumber,
    string PreferredLanguage,
    string TimeZone,
    string? ProfileImageUrl) : ICommand<Result<Unit>>;

public sealed class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateUserCommandHandler> _logger;

    public UpdateUserCommandHandler(IUnitOfWork unitOfWork, ILogger<UpdateUserCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<ApplicationUser>();
        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null || user.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.User.NotFound(request.UserId));
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.DisplayName = request.DisplayName;
        user.PhoneNumber = request.PhoneNumber;
        user.PreferredLanguage = request.PreferredLanguage;
        user.TimeZone = request.TimeZone;
        user.ProfileImageUrl = request.ProfileImageUrl;
        user.LastModifiedAtUtc = DateTime.UtcNow;

        user.AddDomainEvent(new UserUpdatedEvent(user.Id));

        userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User Updated: {UserId}", user.Id);
        return Result.Success(Unit.Value);
    }
}

public sealed class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.PreferredLanguage).MaximumLength(10);
        RuleFor(x => x.TimeZone).MaximumLength(50);
    }
}

// ----------------------------------------------------
// 3. DeleteUserCommand (Soft Delete)
// ----------------------------------------------------
public sealed record DeleteUserCommand(Guid UserId) : ICommand<Result<Unit>>;

public sealed class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteUserCommandHandler> _logger;

    public DeleteUserCommandHandler(IUnitOfWork unitOfWork, ILogger<DeleteUserCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<ApplicationUser>();
        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null || user.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.User.NotFound(request.UserId));
        }

        user.IsDeleted = true;
        user.IsActive = false;
        user.LastModifiedAtUtc = DateTime.UtcNow;

        userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User Soft Deleted: {UserId}", user.Id);
        return Result.Success(Unit.Value);
    }
}

// ----------------------------------------------------
// 4. ActivateUserCommand
// ----------------------------------------------------
public sealed record ActivateUserCommand(Guid UserId) : ICommand<Result<Unit>>;

public sealed class ActivateUserCommandHandler : IRequestHandler<ActivateUserCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public ActivateUserCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(ActivateUserCommand request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<ApplicationUser>();
        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null || user.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.User.NotFound(request.UserId));
        }

        user.IsActive = true;
        user.LastModifiedAtUtc = DateTime.UtcNow;
        user.AddDomainEvent(new UserActivatedEvent(user.Id));

        userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(Unit.Value);
    }
}

// ----------------------------------------------------
// 5. DeactivateUserCommand
// ----------------------------------------------------
public sealed record DeactivateUserCommand(Guid UserId) : ICommand<Result<Unit>>;

public sealed class DeactivateUserCommandHandler : IRequestHandler<DeactivateUserCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeactivateUserCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(DeactivateUserCommand request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<ApplicationUser>();
        var roleRepo = _unitOfWork.Repository<ApplicationRole>();
        var userRoleRepo = _unitOfWork.Repository<UserRole>();

        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null || user.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.User.NotFound(request.UserId));
        }

        // Business rule: Cannot deactivate the last administrator
        var adminRoles = await roleRepo.FindAsync(r => r.Code == "ADMIN" || r.Name == "Administrator", cancellationToken);
        if (adminRoles.Any())
        {
            var adminRoleId = adminRoles.First().Id;
            var userRoles = await userRoleRepo.FindAsync(ur => ur.RoleId == adminRoleId && !ur.IsDeleted, cancellationToken);
            var activeAdminUserIds = userRoles.Select(ur => ur.UserId).Distinct().ToList();

            var activeAdmins = await userRepo.FindAsync(u => activeAdminUserIds.Contains(u.Id) && u.IsActive && !u.IsDeleted, cancellationToken);
            if (activeAdmins.Count == 1 && activeAdmins.First().Id == request.UserId)
            {
                return Result.Failure<Unit>(IamErrors.User.CannotDeactivateLastAdmin);
            }
        }

        user.IsActive = false;
        user.LastModifiedAtUtc = DateTime.UtcNow;
        user.AddDomainEvent(new UserDeactivatedEvent(user.Id));

        userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(Unit.Value);
    }
}

// ----------------------------------------------------
// 6. LockUserCommand
// ----------------------------------------------------
public sealed record LockUserCommand(Guid UserId, DateTime? LockoutEndUtc) : ICommand<Result<Unit>>;

public sealed class LockUserCommandHandler : IRequestHandler<LockUserCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public LockUserCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Unit>> Handle(LockUserCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == request.UserId.ToString())
        {
            return Result.Failure<Unit>(IamErrors.User.CannotLockSelf);
        }

        var userRepo = _unitOfWork.Repository<ApplicationUser>();
        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null || user.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.User.NotFound(request.UserId));
        }

        user.IsLocked = true;
        user.LockoutEnd = request.LockoutEndUtc.HasValue ? new DateTimeOffset(request.LockoutEndUtc.Value) : DateTimeOffset.MaxValue;
        user.LastModifiedAtUtc = DateTime.UtcNow;

        user.AddDomainEvent(new UserLockedEvent(user.Id, _currentUserService.Username ?? "System"));

        userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(Unit.Value);
    }
}

// ----------------------------------------------------
// 7. UnlockUserCommand
// ----------------------------------------------------
public sealed record UnlockUserCommand(Guid UserId) : ICommand<Result<Unit>>;

public sealed class UnlockUserCommandHandler : IRequestHandler<UnlockUserCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public UnlockUserCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Unit>> Handle(UnlockUserCommand request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<ApplicationUser>();
        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null || user.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.User.NotFound(request.UserId));
        }

        user.IsLocked = false;
        user.LockoutEnd = null;
        user.AccessFailedCount = 0;
        user.LastModifiedAtUtc = DateTime.UtcNow;

        user.AddDomainEvent(new UserUnlockedEvent(user.Id, _currentUserService.Username ?? "System"));

        userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(Unit.Value);
    }
}
