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
// 8. ChangePasswordCommand
// ----------------------------------------------------
public sealed record ChangePasswordCommand(
    Guid UserId,
    string CurrentPassword,
    string NewPassword) : ICommand<Result<Unit>>;

public sealed class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ChangePasswordCommandHandler> _logger;

    public ChangePasswordCommandHandler(IUnitOfWork unitOfWork, ILogger<ChangePasswordCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<ApplicationUser>();
        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null || user.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.User.NotFound(request.UserId));
        }

        if (user.PasswordHash != "HASHED:" + request.CurrentPassword)
        {
            return Result.Failure<Unit>(IamErrors.User.CurrentPasswordIncorrect);
        }

        user.PasswordHash = "HASHED:" + request.NewPassword;
        user.LastPasswordChangedUtc = DateTime.UtcNow;
        user.RequirePasswordChange = false;
        user.LastModifiedAtUtc = DateTime.UtcNow;

        user.AddDomainEvent(new PasswordChangedEvent(user.Id));

        userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Password changed for user {UserId}", user.Id);
        return Result.Success(Unit.Value);
    }
}

public sealed class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .MinimumLength(8)
            .Matches(@"[A-Z]")
            .Matches(@"[a-z]")
            .Matches(@"[0-9]");
    }
}

// ----------------------------------------------------
// 9. ForcePasswordResetCommand
// ----------------------------------------------------
public sealed record ForcePasswordResetCommand(Guid UserId) : ICommand<Result<Unit>>;

public sealed class ForcePasswordResetCommandHandler : IRequestHandler<ForcePasswordResetCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public ForcePasswordResetCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(ForcePasswordResetCommand request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<ApplicationUser>();
        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null || user.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.User.NotFound(request.UserId));
        }

        user.RequirePasswordChange = true;
        user.LastModifiedAtUtc = DateTime.UtcNow;

        userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(Unit.Value);
    }
}

// ----------------------------------------------------
// 10. AssignRoleCommand
// ----------------------------------------------------
public sealed record AssignRoleCommand(Guid UserId, Guid RoleId) : ICommand<Result<Unit>>;

public sealed class AssignRoleCommandHandler : IRequestHandler<AssignRoleCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AssignRoleCommandHandler> _logger;

    public AssignRoleCommandHandler(IUnitOfWork unitOfWork, ILogger<AssignRoleCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(AssignRoleCommand request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<ApplicationUser>();
        var roleRepo = _unitOfWork.Repository<ApplicationRole>();
        var userRoleRepo = _unitOfWork.Repository<UserRole>();

        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null || user.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.User.NotFound(request.UserId));
        }

        if (!user.IsActive)
        {
            return Result.Failure<Unit>(IamErrors.User.InactiveCannotReceiveRoles);
        }

        var role = await roleRepo.GetByIdAsync(request.RoleId, cancellationToken);
        if (role is null || role.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.Role.NotFound(request.RoleId));
        }

        var existingUserRole = await userRoleRepo.FindAsync(ur => ur.UserId == request.UserId && ur.RoleId == request.RoleId && !ur.IsDeleted, cancellationToken);
        if (existingUserRole.Any())
        {
            return Result.Failure<Unit>(IamErrors.Role.DuplicateAssignment(role.Name ?? role.Code));
        }

        var userRole = new UserRole
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            RoleId = request.RoleId,
            CreatedAtUtc = DateTime.UtcNow
        };

        user.AddDomainEvent(new RoleAssignedEvent(user.Id, role.Id, role.Name ?? role.Code));

        await userRoleRepo.AddAsync(userRole, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Role {RoleId} assigned to User {UserId}", role.Id, user.Id);
        return Result.Success(Unit.Value);
    }
}

// ----------------------------------------------------
// 11. RemoveRoleCommand
// ----------------------------------------------------
public sealed record RemoveRoleCommand(Guid UserId, Guid RoleId) : ICommand<Result<Unit>>;

public sealed class RemoveRoleCommandHandler : IRequestHandler<RemoveRoleCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public RemoveRoleCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(RemoveRoleCommand request, CancellationToken cancellationToken)
    {
        var userRoleRepo = _unitOfWork.Repository<UserRole>();
        var roleRepo = _unitOfWork.Repository<ApplicationRole>();
        var userRepo = _unitOfWork.Repository<ApplicationUser>();

        var userRoleList = await userRoleRepo.FindAsync(ur => ur.UserId == request.UserId && ur.RoleId == request.RoleId && !ur.IsDeleted, cancellationToken);
        if (!userRoleList.Any())
        {
            return Result.Success(Unit.Value); // Idempotent or success if not assigned
        }

        var role = await roleRepo.GetByIdAsync(request.RoleId, cancellationToken);

        // Business rule: Cannot remove final administrator role if this is the last admin
        if (role != null && (role.Code == "ADMIN" || role.Name == "Administrator"))
        {
            var allAdminUserRoles = await userRoleRepo.FindAsync(ur => ur.RoleId == request.RoleId && !ur.IsDeleted, cancellationToken);
            if (allAdminUserRoles.Count <= 1)
            {
                return Result.Failure<Unit>(IamErrors.Role.CannotRemoveLastAdminRole);
            }
        }

        var userRole = userRoleList.First();
        userRole.IsDeleted = true;

        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken);
        if (user != null)
        {
            user.AddDomainEvent(new RoleRemovedEvent(user.Id, request.RoleId, role?.Name ?? "Role"));
        }

        userRoleRepo.Update(userRole);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(Unit.Value);
    }
}

// ----------------------------------------------------
// 12. UpdateUserPreferenceCommand
// ----------------------------------------------------
public sealed record UpdateUserPreferenceCommand(
    Guid UserId,
    string Theme,
    string Language,
    string TimeZone,
    string DateFormat,
    string NumberFormat,
    string? NotificationPreferences) : ICommand<Result<Unit>>;

public sealed class UpdateUserPreferenceCommandHandler : IRequestHandler<UpdateUserPreferenceCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUserPreferenceCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(UpdateUserPreferenceCommand request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<ApplicationUser>();
        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null || user.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.User.NotFound(request.UserId));
        }

        var prefRepo = _unitOfWork.Repository<UserPreference>();
        var existing = await prefRepo.FindAsync(p => p.UserId == request.UserId && !p.IsDeleted, cancellationToken);

        if (existing.Any())
        {
            var pref = existing.First();
            pref.Theme = request.Theme;
            pref.Language = request.Language;
            pref.TimeZone = request.TimeZone;
            pref.DateFormat = request.DateFormat;
            pref.NumberFormat = request.NumberFormat;
            pref.NotificationPreferences = request.NotificationPreferences;
            pref.LastModifiedAtUtc = DateTime.UtcNow;
            prefRepo.Update(pref);
        }
        else
        {
            var pref = new UserPreference
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Theme = request.Theme,
                Language = request.Language,
                TimeZone = request.TimeZone,
                DateFormat = request.DateFormat,
                NumberFormat = request.NumberFormat,
                NotificationPreferences = request.NotificationPreferences,
                CreatedAtUtc = DateTime.UtcNow
            };
            await prefRepo.AddAsync(pref, cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(Unit.Value);
    }
}

public sealed class UpdateUserPreferenceCommandValidator : AbstractValidator<UpdateUserPreferenceCommand>
{
    public UpdateUserPreferenceCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Theme).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Language).NotEmpty().MaximumLength(10);
        RuleFor(x => x.TimeZone).NotEmpty().MaximumLength(50);
        RuleFor(x => x.DateFormat).NotEmpty().MaximumLength(20);
        RuleFor(x => x.NumberFormat).NotEmpty().MaximumLength(20);
    }
}
