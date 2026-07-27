using System.Linq.Expressions;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Application.Features.IAM.Commands.Users;
using INK.ERP.Domain.Common;

namespace INK.ERP.UnitTests.IAM;

public sealed class CreateUserCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IGenericRepository<ApplicationUser>> _userRepoMock;
    private readonly Mock<ILogger<CreateUserCommandHandler>> _loggerMock;
    private readonly CreateUserCommandHandler _handler;

    public CreateUserCommandHandlerTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _userRepoMock = new Mock<IGenericRepository<ApplicationUser>>();
        _loggerMock = new Mock<ILogger<CreateUserCommandHandler>>();

        _unitOfWorkMock.Setup(u => u.Repository<ApplicationUser>()).Returns(_userRepoMock.Object);

        _handler = new CreateUserCommandHandler(_unitOfWorkMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsSuccessWithUserId()
    {
        // Arrange
        _userRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<ApplicationUser, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ApplicationUser>());

        var command = new CreateUserCommand(
            "john.doe",
            "john.doe@example.com",
            "+1234567890",
            "John",
            "Doe",
            "John Doe",
            "SecureP@ss123",
            null,
            "en",
            "UTC");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        _userRepoMock.Verify(r => r.AddAsync(It.Is<ApplicationUser>(u => u.UserName == "john.doe"), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_DuplicateUsername_ReturnsConflictError()
    {
        // Arrange
        var existingUser = new ApplicationUser { UserName = "john.doe", Email = "other@example.com" };

        _userRepoMock.Setup(r => r.FindAsync(It.IsAny<Expression<Func<ApplicationUser, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ApplicationUser> { existingUser });

        var command = new CreateUserCommand(
            "john.doe",
            "john.doe@example.com",
            null,
            "John",
            "Doe",
            "John Doe",
            "SecureP@ss123",
            null,
            "en",
            "UTC");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("User.UsernameExists");
    }

    [Fact]
    public async Task Handle_DuplicateEmail_ReturnsConflictError()
    {
        // Arrange
        var existingUser = new ApplicationUser { UserName = "other.user", Email = "john.doe@example.com" };

        _userRepoMock.SetupSequence(r => r.FindAsync(It.IsAny<Expression<Func<ApplicationUser, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ApplicationUser>()) // First call for username check
            .ReturnsAsync(new List<ApplicationUser> { existingUser }); // Second call for email check

        var command = new CreateUserCommand(
            "john.doe",
            "john.doe@example.com",
            null,
            "John",
            "Doe",
            "John Doe",
            "SecureP@ss123",
            null,
            "en",
            "UTC");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("User.EmailExists");
    }
}
