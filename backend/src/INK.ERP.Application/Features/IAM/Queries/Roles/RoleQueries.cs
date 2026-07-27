using Mapster;
using MediatR;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Common;
using INK.ERP.Application.Features.IAM.DTOs;
using INK.ERP.Application.Features.IAM;

namespace INK.ERP.Application.Features.IAM.Queries.Roles;

// 3. GetRoleByIdQuery
public sealed record GetRoleByIdQuery(Guid RoleId) : IQuery<Result<RoleDto>>;

public sealed class GetRoleByIdQueryHandler : IRequestHandler<GetRoleByIdQuery, Result<RoleDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetRoleByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<RoleDto>> Handle(GetRoleByIdQuery request, CancellationToken cancellationToken)
    {
        var roleRepo = _unitOfWork.Repository<ApplicationRole>();
        var role = await roleRepo.GetByIdAsync(request.RoleId, cancellationToken);

        if (role is null || role.IsDeleted)
        {
            return Result.Failure<RoleDto>(IamErrors.Role.NotFound(request.RoleId));
        }

        var dto = role.Adapt<RoleDto>();
        return Result.Success(dto);
    }
}

// 4. GetRolesQuery
public sealed record GetRolesQuery(bool? IsActive = null) : IQuery<Result<IReadOnlyList<RoleDto>>>;

public sealed class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, Result<IReadOnlyList<RoleDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetRolesQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<RoleDto>>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
    {
        var roleRepo = _unitOfWork.Repository<ApplicationRole>();
        var roles = await roleRepo.FindAsync(r => !r.IsDeleted &&
            (!request.IsActive.HasValue || r.IsActive == request.IsActive.Value), cancellationToken);

        var dtos = roles.Adapt<IReadOnlyList<RoleDto>>();
        return Result.Success(dtos);
    }
}
