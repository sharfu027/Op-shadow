using System.Linq.Expressions;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Application.Features.IAM.Commands.Users;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.Entities.IAM;

namespace INK.ERP.UnitTests.IAM;

public sealed class AssignRoleCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IGenericRepository<ApplicationUser>> _userRepoMock;
    private readonly Mock<IGenericRepository<ApplicationRole>> _roleRepoMock;
    private readonly Mock<IGenericRepository<UserRole>> _userRoleRepoMock;
    private readonly Mock<ILogger<AssignRoleCommandHandler>> _loggerMock;
    private readonly AssignRoleCommandHandler _handler;

    public AssignRoleCommandHandlerTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _userRepoMock = new Mock<IGenericRepository<ApplicationUser>>();
        _roleRepoMock = new Mock<IGenericRepository<ApplicationRole>>();
        _userRoleRepoMock = new Mock<IGenericRepository<UserRole>>();
        _loggerMock = new Mock<ILogger<AssignRoleCommandHandler>>();

        _unitOfWorkMock.Setup(u => u.Repository<ApplicationUser>()).Returns(_userRepoMock.Object);
        _unitOfWorkMock.Setup(u => u.Repository<ApplicationRole>()).Returns(_roleRepoMock.Object);
        _unitOfWorkMock.Setup(u => u.Repository<UserRole>()).Returns(_userRoleRepoMock.Object);

        _handler = new AssignRoleCommandHandler(_unitOfWorkMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsSuccess()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var roleId = Guid.NewGuid();

        var user = new ApplicationUser { Id = userId, IsActive = true };
        var role = new ApplicationRole { Id = roleId, Name = "Manager", Code = "MANAGER" };

        _userRepoMock.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _roleRepoMock.Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>())).ReturnsAsync(role);
        _userRoleRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<UserRole, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserRole>());

        var command = new AssignRoleCommand(userId, roleId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _userRoleRepoMock.Verify(r => r.AddAsync(It.Is<UserRole>(ur => ur.UserId == userId && ur.RoleId == roleId), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_UserNotFound_ReturnsNotFoundError()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userRepoMock.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync((ApplicationUser?)null);

        var command = new AssignRoleCommand(userId, Guid.NewGuid());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("User.NotFound");
    }

    [Fact]
    public async Task Handle_InactiveUser_ReturnsFailureError()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new ApplicationUser { Id = userId, IsActive = false };
        _userRepoMock.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);

        var command = new AssignRoleCommand(userId, Guid.NewGuid());

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("User.Inactive");
    }

    [Fact]
    public async Task Handle_DuplicateRole_ReturnsConflictError()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var roleId = Guid.NewGuid();

        var user = new ApplicationUser { Id = userId, IsActive = true };
        var role = new ApplicationRole { Id = roleId, Name = "Manager", Code = "MANAGER" };
        var existingUserRole = new UserRole { UserId = userId, RoleId = roleId };

        _userRepoMock.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        _roleRepoMock.Setup(r => r.GetByIdAsync(roleId, It.IsAny<CancellationToken>())).ReturnsAsync(role);
        _userRoleRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<UserRole, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserRole> { existingUserRole });

        var command = new AssignRoleCommand(userId, roleId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("Role.Duplicate");
    }
}
