using Mapster;
using MediatR;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Application.Common.Models;
using INK.ERP.Domain.Common;
using INK.ERP.Application.Features.IAM.DTOs;
using INK.ERP.Application.Features.IAM.Filters;
using INK.ERP.Application.Features.IAM.Specifications;
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

// 4. GetRolesQuery (Paged with Specification)
public sealed record GetRolesQuery(RoleFilter Filter) : IQuery<Result<PagedResult<RoleDto>>>;

public sealed class GetRolesQueryHandler : IRequestHandler<GetRolesQuery, Result<PagedResult<RoleDto>>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetRolesQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<RoleDto>>> Handle(GetRolesQuery request, CancellationToken cancellationToken)
    {
        var roleRepo = _unitOfWork.Repository<ApplicationRole>();
        var spec = new RoleFilterSpecification(request.Filter);

        var roles = await roleRepo.ListAsync(spec, cancellationToken);
        var totalCount = await roleRepo.CountAsync(spec, cancellationToken);

        var dtos = roles.Adapt<IReadOnlyList<RoleDto>>();
        var pagedResult = PagedResult<RoleDto>.Create(dtos, totalCount, request.Filter.PageNumber, request.Filter.PageSize);

        return Result.Success(pagedResult);
    }
}
