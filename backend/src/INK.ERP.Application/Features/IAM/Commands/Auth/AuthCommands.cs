using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.Entities.IAM;
using INK.ERP.Application.Features.IAM.DTOs;
using INK.ERP.Application.Features.IAM.Services;

namespace INK.ERP.Application.Features.IAM.Commands.Auth;

// ----------------------------------------------------
// 1. LoginCommand
// ----------------------------------------------------
public sealed record LoginCommand(
    string Username,
    string Password,
    string IpAddress,
    string UserAgent) : ICommand<Result<AuthResponseDto>>;

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthResponseDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly IPermissionResolver _permissionResolver;
    private readonly IDateTime _dateTime;
    private readonly ILogger<LoginCommandHandler> _logger;

    public LoginCommandHandler(
        IUnitOfWork unitOfWork,
        ITokenService tokenService,
        IPermissionResolver permissionResolver,
        IDateTime dateTime,
        ILogger<LoginCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _permissionResolver = permissionResolver;
        _dateTime = dateTime;
        _logger = logger;
    }

    public async Task<Result<AuthResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<ApplicationUser>();
        var userRoleRepo = _unitOfWork.Repository<UserRole>();
        var roleRepo = _unitOfWork.Repository<ApplicationRole>();
        var loginHistoryRepo = _unitOfWork.Repository<LoginHistory>();
        var refreshTokenRepo = _unitOfWork.Repository<RefreshToken>();

        var users = await userRepo.FindAsync(u => (u.UserName == request.Username || u.Email == request.Username) && !u.IsDeleted, cancellationToken);
        var user = users.FirstOrDefault();

        var loginHistory = new LoginHistory
        {
            Id = Guid.NewGuid(),
            UserId = user?.Id,
            Username = request.Username,
            IpAddress = request.IpAddress,
            Browser = request.UserAgent,
            Device = "Web Client",
            OperatingSystem = "Unknown",
            CreatedAtUtc = _dateTime.UtcNow
        };

        if (user is null)
        {
            loginHistory.IsSuccessful = false;
            loginHistory.FailureReason = "User not found";
            await loginHistoryRepo.AddAsync(loginHistory, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Failure<AuthResponseDto>(new Error("IAM.USER.INVALID_CREDENTIALS", "Invalid username or password.", ErrorType.Unauthorized));
        }

        if (user.IsLocked && user.LockoutEnd > _dateTime.UtcNow)
        {
            loginHistory.IsSuccessful = false;
            loginHistory.FailureReason = "Account locked";
            await loginHistoryRepo.AddAsync(loginHistory, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Failure<AuthResponseDto>(new Error("IAM.USER.LOCKED", "Account is locked.", ErrorType.Unauthorized));
        }

        if (!user.IsActive)
        {
            loginHistory.IsSuccessful = false;
            loginHistory.FailureReason = "Account inactive";
            await loginHistoryRepo.AddAsync(loginHistory, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Failure<AuthResponseDto>(new Error("IAM.USER.INACTIVE", "Account is inactive.", ErrorType.Unauthorized));
        }

        if (user.PasswordHash != "HASHED:" + request.Password && user.PasswordHash != request.Password)
        {
            user.AccessFailedCount++;
            if (user.AccessFailedCount >= 5)
            {
                user.IsLocked = true;
                user.LockoutEnd = _dateTime.UtcNow.AddMinutes(15);
            }
            userRepo.Update(user);

            loginHistory.IsSuccessful = false;
            loginHistory.FailureReason = "Invalid password";
            await loginHistoryRepo.AddAsync(loginHistory, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Failure<AuthResponseDto>(new Error("IAM.USER.INVALID_CREDENTIALS", "Invalid username or password.", ErrorType.Unauthorized));
        }

        user.AccessFailedCount = 0;
        user.LastLoginUtc = _dateTime.UtcNow;
        userRepo.Update(user);

        var userRoles = await userRoleRepo.FindAsync(ur => ur.UserId == user.Id && !ur.IsDeleted, cancellationToken);
        var roleIds = userRoles.Select(ur => ur.RoleId).ToList();
        var roles = await roleRepo.FindAsync(r => roleIds.Contains(r.Id) && !r.IsDeleted, cancellationToken);
        var roleNames = roles.Select(r => r.Name ?? r.Code).ToList();

        var permissions = await _permissionResolver.GetPermissionsForUserAsync(user.Id, cancellationToken);

        var accessToken = _tokenService.GenerateJwtToken(user, roleNames, permissions);
        var (refreshTokenEntity, rawRefreshToken) = _tokenService.GenerateRefreshToken(user.Id, request.IpAddress);

        await refreshTokenRepo.AddAsync(refreshTokenEntity, cancellationToken);

        loginHistory.IsSuccessful = true;
        await loginHistoryRepo.AddAsync(loginHistory, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User logged in successfully: {UserId} ({Username})", user.Id, user.UserName);

        var userDto = new UserDto(
            user.Id, user.UserName ?? string.Empty, user.Email ?? string.Empty, user.PhoneNumber,
            user.FirstName, user.LastName, user.DisplayName, user.EmployeeId, user.IsActive,
            user.IsLocked, user.LastLoginUtc, user.TwoFactorEnabled, user.EmailConfirmed,
            user.RequirePasswordChange, user.PreferredLanguage, user.TimeZone, user.ProfileImageUrl,
            user.CreatedAtUtc, user.LastModifiedAtUtc, roleNames);

        return Result.Success(new AuthResponseDto(accessToken, rawRefreshToken, _dateTime.UtcNow.AddHours(1), userDto));
    }
}

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Username).NotEmpty();
        RuleFor(x => x.Password).NotEmpty();
    }
}

// ----------------------------------------------------
// 2. RefreshTokenCommand
// ----------------------------------------------------
public sealed record RefreshTokenCommand(string RefreshToken, string IpAddress) : ICommand<Result<AuthResponseDto>>;

public sealed class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponseDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly IDateTime _dateTime;

    public RefreshTokenCommandHandler(IUnitOfWork unitOfWork, ITokenService tokenService, IDateTime dateTime)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _dateTime = dateTime;
    }

    public async Task<Result<AuthResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var rotationResult = await _tokenService.RotateRefreshTokenAsync(request.RefreshToken, request.IpAddress, cancellationToken);
        if (rotationResult.IsFailure)
        {
            return Result.Failure<AuthResponseDto>(rotationResult.Error);
        }

        var (newAccessToken, newRefreshTokenEntity) = rotationResult.Value;

        var userRepo = _unitOfWork.Repository<ApplicationUser>();
        var userRoleRepo = _unitOfWork.Repository<UserRole>();
        var roleRepo = _unitOfWork.Repository<ApplicationRole>();

        var user = await userRepo.GetByIdAsync(newRefreshTokenEntity.UserId, cancellationToken);
        var userRoles = await userRoleRepo.FindAsync(ur => ur.UserId == user!.Id && !ur.IsDeleted, cancellationToken);
        var roleIds = userRoles.Select(ur => ur.RoleId).ToList();
        var roles = await roleRepo.FindAsync(r => roleIds.Contains(r.Id) && !r.IsDeleted, cancellationToken);
        var roleNames = roles.Select(r => r.Name ?? r.Code).ToList();

        var userDto = new UserDto(
            user!.Id, user.UserName ?? string.Empty, user.Email ?? string.Empty, user.PhoneNumber,
            user.FirstName, user.LastName, user.DisplayName, user.EmployeeId, user.IsActive,
            user.IsLocked, user.LastLoginUtc, user.TwoFactorEnabled, user.EmailConfirmed,
            user.RequirePasswordChange, user.PreferredLanguage, user.TimeZone, user.ProfileImageUrl,
            user.CreatedAtUtc, user.LastModifiedAtUtc, roleNames);

        return Result.Success(new AuthResponseDto(newAccessToken, newRefreshTokenEntity.Token, _dateTime.UtcNow.AddHours(1), userDto));
    }
}

// ----------------------------------------------------
// 3. Logout / Revoke Token Command
// ----------------------------------------------------
public sealed record RevokeTokenCommand(string RefreshToken, string Reason, string IpAddress) : ICommand<Result<Unit>>;

public sealed class RevokeTokenCommandHandler : IRequestHandler<RevokeTokenCommand, Result<Unit>>
{
    private readonly ITokenService _tokenService;

    public RevokeTokenCommandHandler(ITokenService tokenService)
    {
        _tokenService = tokenService;
    }

    public async Task<Result<Unit>> Handle(RevokeTokenCommand request, CancellationToken cancellationToken)
    {
        var result = await _tokenService.RevokeRefreshTokenAsync(request.RefreshToken, request.Reason, request.IpAddress, cancellationToken);
        if (result.IsFailure)
        {
            return Result.Failure<Unit>(result.Error);
        }
        return Result.Success(Unit.Value);
    }
}

// ----------------------------------------------------
// 4. ForgotPassword, ResetPassword, VerifyEmail, ResendVerification
// ----------------------------------------------------
public sealed record ForgotPasswordCommand(string Email) : ICommand<Result<Unit>>;

public sealed class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Result<Unit>>
{
    public Task<Result<Unit>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        return Task.FromResult(Result.Success(Unit.Value));
    }
}

public sealed record ResetPasswordCommand(string Email, string Token, string NewPassword) : ICommand<Result<Unit>>;

public sealed class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordPolicyService _passwordPolicyService;

    public ResetPasswordCommandHandler(IUnitOfWork unitOfWork, IPasswordPolicyService passwordPolicyService)
    {
        _unitOfWork = unitOfWork;
        _passwordPolicyService = passwordPolicyService;
    }

    public async Task<Result<Unit>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var policyResult = _passwordPolicyService.ValidatePassword(request.NewPassword);
        if (policyResult.IsFailure)
        {
            return Result.Failure<Unit>(policyResult.Error);
        }

        var userRepo = _unitOfWork.Repository<ApplicationUser>();
        var users = await userRepo.FindAsync(u => u.Email == request.Email && !u.IsDeleted, cancellationToken);
        var user = users.FirstOrDefault();
        if (user == null)
        {
            return Result.Success(Unit.Value); // Don't expose email non-existence for security
        }

        user.PasswordHash = "HASHED:" + request.NewPassword;
        user.RequirePasswordChange = false;
        userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(Unit.Value);
    }
}

public sealed record VerifyEmailCommand(Guid UserId, string Token) : ICommand<Result<Unit>>;

public sealed class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public VerifyEmailCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        var userRepo = _unitOfWork.Repository<ApplicationUser>();
        var user = await userRepo.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null || user.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.User.NotFound(request.UserId));
        }

        user.EmailConfirmed = true;
        userRepo.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(Unit.Value);
    }
}

public sealed record ResendVerificationCommand(string Email) : ICommand<Result<Unit>>;

public sealed class ResendVerificationCommandHandler : IRequestHandler<ResendVerificationCommand, Result<Unit>>
{
    public Task<Result<Unit>> Handle(ResendVerificationCommand request, CancellationToken cancellationToken)
    {
        return Task.FromResult(Result.Success(Unit.Value));
    }
}
