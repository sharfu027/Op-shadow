using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.Events.IAM;
using INK.ERP.Application.Features.IAM;

namespace INK.ERP.Application.Features.IAM.Commands.Roles;

// ----------------------------------------------------
// 16. CreateRoleCommand
// ----------------------------------------------------
public sealed record CreateRoleCommand(
    string Name,
    string Code,
    string Description,
    bool IsSystem,
    int Priority) : ICommand<Result<Guid>>;

public sealed class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, Result<Guid>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateRoleCommandHandler> _logger;

    public CreateRoleCommandHandler(IUnitOfWork unitOfWork, ILogger<CreateRoleCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        var roleRepo = _unitOfWork.Repository<ApplicationRole>();
        var existing = await roleRepo.FindAsync(r => r.Code == request.Code && !r.IsDeleted, cancellationToken);
        if (existing.Any())
        {
            return Result.Failure<Guid>(IamErrors.Role.CodeAlreadyExists(request.Code));
        }

        var role = new ApplicationRole
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            NormalizedName = request.Name.ToUpperInvariant(),
            Code = request.Code,
            Description = request.Description,
            IsSystem = request.IsSystem,
            Priority = request.Priority,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        role.AddDomainEvent(new RoleCreatedEvent(role.Id, role.Code));

        await roleRepo.AddAsync(role, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Role Created: {RoleId} ({Code})", role.Id, role.Code);
        return Result.Success(role.Id);
    }
}

public sealed class CreateRoleCommandValidator : AbstractValidator<CreateRoleCommand>
{
    public CreateRoleCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(100).Matches(@"^[A-Z0-9_]+$");
        RuleFor(x => x.Description).MaximumLength(250);
    }
}

// ----------------------------------------------------
// 17. UpdateRoleCommand
// ----------------------------------------------------
public sealed record UpdateRoleCommand(
    Guid RoleId,
    string Name,
    string Description,
    int Priority,
    bool IsActive) : ICommand<Result<Unit>>;

public sealed class UpdateRoleCommandHandler : IRequestHandler<UpdateRoleCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRoleCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
    {
        var roleRepo = _unitOfWork.Repository<ApplicationRole>();
        var role = await roleRepo.GetByIdAsync(request.RoleId, cancellationToken);
        if (role is null || role.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.Role.NotFound(request.RoleId));
        }

        role.Name = request.Name;
        role.NormalizedName = request.Name.ToUpperInvariant();
        role.Description = request.Description;
        role.Priority = request.Priority;
        role.IsActive = request.IsActive;
        role.LastModifiedAtUtc = DateTime.UtcNow;

        role.AddDomainEvent(new RoleUpdatedEvent(role.Id));

        roleRepo.Update(role);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(Unit.Value);
    }
}

public sealed class UpdateRoleCommandValidator : AbstractValidator<UpdateRoleCommand>
{
    public UpdateRoleCommandValidator()
    {
        RuleFor(x => x.RoleId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(250);
    }
}

// ----------------------------------------------------
// 18. DeleteRoleCommand
// ----------------------------------------------------
public sealed record DeleteRoleCommand(Guid RoleId) : ICommand<Result<Unit>>;

public sealed class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteRoleCommandHandler> _logger;

    public DeleteRoleCommandHandler(IUnitOfWork unitOfWork, ILogger<DeleteRoleCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
    {
        var roleRepo = _unitOfWork.Repository<ApplicationRole>();
        var role = await roleRepo.GetByIdAsync(request.RoleId, cancellationToken);
        if (role is null || role.IsDeleted)
        {
            return Result.Failure<Unit>(IamErrors.Role.NotFound(request.RoleId));
        }

        // Business rule: Cannot delete System Role
        if (role.IsSystem)
        {
            return Result.Failure<Unit>(IamErrors.Role.CannotDeleteSystemRole);
        }

        role.IsDeleted = true;
        role.IsActive = false;
        role.LastModifiedAtUtc = DateTime.UtcNow;

        role.AddDomainEvent(new RoleDeletedEvent(role.Id, role.Code));

        roleRepo.Update(role);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Role Deleted: {RoleId} ({Code})", role.Id, role.Code);
        return Result.Success(Unit.Value);
    }
}
