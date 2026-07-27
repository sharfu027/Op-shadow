namespace INK.ERP.Application.Features.IAM.DTOs;

public sealed record RoleDto(
    Guid Id,
    string Name,
    string Code,
    string Description,
    bool IsSystem,
    int Priority,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? LastModifiedAtUtc);
