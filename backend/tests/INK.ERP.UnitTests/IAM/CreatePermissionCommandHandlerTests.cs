using System.Linq.Expressions;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Application.Features.IAM.Commands.Permissions;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.Entities.IAM;

namespace INK.ERP.UnitTests.IAM;

public sealed class CreatePermissionCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IGenericRepository<Permission>> _permRepoMock;
    private readonly Mock<IGenericRepository<PermissionGroup>> _groupRepoMock;
    private readonly Mock<ILogger<CreatePermissionCommandHandler>> _loggerMock;
    private readonly CreatePermissionCommandHandler _handler;

    public CreatePermissionCommandHandlerTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _permRepoMock = new Mock<IGenericRepository<Permission>>();
        _groupRepoMock = new Mock<IGenericRepository<PermissionGroup>>();
        _loggerMock = new Mock<ILogger<CreatePermissionCommandHandler>>();

        _unitOfWorkMock.Setup(u => u.Repository<Permission>()).Returns(_permRepoMock.Object);
        _unitOfWorkMock.Setup(u => u.Repository<PermissionGroup>()).Returns(_groupRepoMock.Object);

        _handler = new CreatePermissionCommandHandler(_unitOfWorkMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsSuccessWithPermissionId()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        var group = new PermissionGroup { Id = groupId, Name = "User Management" };

        _groupRepoMock.Setup(r => r.GetByIdAsync(groupId, It.IsAny<CancellationToken>())).ReturnsAsync(group);
        _permRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<Permission, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Permission>());

        var command = new CreatePermissionCommand("Create User", "users:create", "Allows creating users", groupId, 1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
        _permRepoMock.Verify(r => r.AddAsync(It.Is<Permission>(p => p.Code == "users:create"), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PermissionGroupNotFound_ReturnsNotFoundError()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        _groupRepoMock.Setup(r => r.GetByIdAsync(groupId, It.IsAny<CancellationToken>())).ReturnsAsync((PermissionGroup?)null);

        var command = new CreatePermissionCommand("Create User", "users:create", "Description", groupId, 1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Permission.GroupNotFound");
    }

    [Fact]
    public async Task Handle_DuplicateCode_ReturnsConflictError()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        var group = new PermissionGroup { Id = groupId, Name = "User Management" };
        var existingPerm = new Permission { Code = "users:create" };

        _groupRepoMock.Setup(r => r.GetByIdAsync(groupId, It.IsAny<CancellationToken>())).ReturnsAsync(group);
        _permRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<Permission, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Permission> { existingPerm });

        var command = new CreatePermissionCommand("Create User", "users:create", "Description", groupId, 1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Permission.CodeExists");
    }
}
