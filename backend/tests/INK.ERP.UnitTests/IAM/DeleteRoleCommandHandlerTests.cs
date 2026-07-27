using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Application.Features.IAM.Commands.Roles;
using INK.ERP.Domain.Common;

namespace INK.ERP.UnitTests.IAM;

public sealed class DeleteRoleCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IGenericRepository<ApplicationRole>> _roleRepoMock;
    private readonly Mock<ILogger<DeleteRoleCommandHandler>> _loggerMock;
    private readonly DeleteRoleCommandHandler _handler;

    public DeleteRoleCommandHandlerTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _roleRepoMock = new Mock<IGenericRepository<ApplicationRole>>();
        _loggerMock = new Mock<ILogger<DeleteRoleCommandHandler>>();

        _unitOfWorkMock.Setup(u => u.Repository<ApplicationRole>()).Returns(_roleRepoMock.Object);

        _handler = new DeleteRoleCommandHandler(_unitOfWorkMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsSuccess()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        var role = new ApplicationRole { Id = roleId, Code = "CUSTOM_ROLE", IsSystem = false, IsActive = true };

        _roleRepoMock.Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>())).ReturnsAsync(role);

        var command = new DeleteRoleCommand(roleId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        role.IsDeleted.Should().BeTrue();
        role.IsActive.Should().BeFalse();
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_RoleNotFound_ReturnsNotFoundError()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        _roleRepoMock.Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>())).ReturnsAsync((ApplicationRole?)null);

        var command = new DeleteRoleCommand(roleId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Role.NotFound");
    }

    [Fact]
    public async Task Handle_SystemRole_ReturnsFailureError()
    {
        // Arrange
        var roleId = Guid.NewGuid();
        var role = new ApplicationRole { Id = roleId, Code = "ADMIN", IsSystem = true };

        _roleRepoMock.Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>())).ReturnsAsync(role);

        var command = new DeleteRoleCommand(roleId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Role.SystemRole");
    }
}
