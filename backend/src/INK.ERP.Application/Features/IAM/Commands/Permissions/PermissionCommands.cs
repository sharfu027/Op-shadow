using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.Entities.IAM;
using INK.ERP.Domain.Events.IAM;
using INK.ERP.Application.Features.IAM;

namespace INK.ERP.Application.Features.IAM.Commands.Permissions;

// ----------------------------------------------------
// 13. CreatePermissionCommand
// ----------------------------------------------------
public sealed record CreatePermissionCommand(
    string Name,
    string Code,
    string Description,
    Guid PermissionGroupId,
    int DisplayOrder) : ICommand<Result<Guid>>;

public sealed class CreatePermissionCommandHandler : IRequestHandler<CreatePermissionCommand, Result<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreatePermissionCommandHandler> _logger;

    public CreatePermissionCommandHandler(IUnitOfWork unitOfWork, ILogger<CreatePermissionCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(CreatePermissionCommand request, CancellationToken cancellationToken)
    {
        var permRepo = _unitOfWork.Repository<Permission>();
        var groupRepo = _unitOfWork.Repository<PermissionGroup>();

        var existingGroup = await groupRepo.GetByIdAsync(request.PermissionGroupId, cancellationToken);
        if (existingGroup is null || existingGroup.IsDeleted)
        {
            return Result.Failure<Guid>(IamErrors.Permission.GroupNotFound(request.PermissionGroupId));
        }

        var existingCode = await permRepo.FindAsync(p => p.Code == request.Code && !p.IsDeleted, cancellationToken);
        if (existingCode.Any())
        {
            return Result.Failure<Guid>(IamErrors.Permission.CodeAlreadyExists(request.Code));
        }

        var permission = new Permission
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            PermissionGroupId = request.PermissionGroupId,
            DisplayOrder = request.DisplayOrder,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        permission.AddDomainEvent(new PermissionCreatedEvent(permission.Id, permission.Code));

        await permRepo.AddAsync(permission, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Permission Created: {PermissionId} ({Code})", permission.Id, permission.Code);
        return Result.Success(permission.Id);
    }
}

public sealed class CreatePermissionCommandValidator : AbstractValidator<CreatePermissionCommand>
{
    public CreatePermissionCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(100).Matches(@"^[a-z0-9_:.-]+$");
        RuleFor(x => x.Description).MaximumLength(250);
        RuleFor(x => x.PermissionGroupId).NotEmpty();
    }
}

// ----------------------------------------------------
// 14. UpdatePermissionCommand
// ----------------------------------------------------
public sealed record UpdatePermissionCommand(
    Guid PermissionId,
    string Name,
    string Description,
    int DisplayOrder,
    bool IsActive) : ICommand<Result<Unit>>;

public sealed class UpdatePermissionCommandHandler : IRequestHandler<UpdatePermissionCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdatePermissionCommandHandler> _logger;

    public UpdatePermissionCommandHandler(IUnitOfWork unitOfWork, ILogger<UpdatePermissionCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(UpdatePermissionCommand request, CancellationToken cancellationToken)
    {
        var permRepo = _unitOfWork.Repository<Permission>();
        var permission = await permRepo.GetByIdAsync(request.PermissionId, cancellationToken);
        if (permission is null || permission.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.Permission.NotFound(request.PermissionId));
        }

        permission.Name = request.Name;
        permission.Description = request.Description;
        permission.DisplayOrder = request.DisplayOrder;
        permission.IsActive = request.IsActive;
        permission.LastModifiedAtUtc = DateTime.UtcNow;

        permission.AddDomainEvent(new PermissionUpdatedEvent(permission.Id));

        permRepo.Update(permission);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Permission Updated: {PermissionId}", permission.Id);
        return Result.Success(Unit.Value);
    }
}

public sealed class UpdatePermissionCommandValidator : AbstractValidator<UpdatePermissionCommand>
{
    public UpdatePermissionCommandValidator()
    {
        RuleFor(x => x.PermissionId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(250);
    }
}

// ----------------------------------------------------
// 15. DeletePermissionCommand
// ----------------------------------------------------
public sealed record DeletePermissionCommand(Guid PermissionId) : ICommand<Result<Unit>>;

public sealed class DeletePermissionCommandHandler : IRequestHandler<DeletePermissionCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeletePermissionCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(DeletePermissionCommand request, CancellationToken cancellationToken)
    {
        var permRepo = _unitOfWork.Repository<Permission>();
        var permission = await permRepo.GetByIdAsync(request.PermissionId, cancellationToken);
        if (permission is null || permission.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.Permission.NotFound(request.PermissionId));
        }

        permission.IsDeleted = true;
        permission.IsActive = false;
        permission.LastModifiedAtUtc = DateTime.UtcNow;

        permission.AddDomainEvent(new PermissionDeletedEvent(permission.Id, permission.Code));

        permRepo.Update(permission);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(Unit.Value);
    }
}
