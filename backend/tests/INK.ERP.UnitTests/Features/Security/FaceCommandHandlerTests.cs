using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using INK.ERP.Application.Common.Interfaces;
using INK.ERP.Domain.Common;
using INK.ERP.Domain.Entities.Security;
using INK.ERP.Domain.ValueObjects.Security;
using INK.ERP.Application.Features.Security.Face;

namespace INK.ERP.UnitTests.Features.Security;

public sealed class FaceCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IGenericRepository<FaceProfile>> _faceProfileRepoMock;
    private readonly Mock<IFaceEmbeddingService> _embeddingServiceMock;
    private readonly Mock<IImageQualityService> _qualityServiceMock;
    private readonly Mock<ILivenessDetectionService> _livenessServiceMock;
    private readonly Mock<ILogger<EnrollFaceCommandHandler>> _loggerMock;
    private readonly EnrollFaceCommandHandler _enrollHandler;

    public FaceCommandHandlerTests()
    {
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _faceProfileRepoMock = new Mock<IGenericRepository<FaceProfile>>();
        _embeddingServiceMock = new Mock<IFaceEmbeddingService>();
        _qualityServiceMock = new Mock<IImageQualityService>();
        _livenessServiceMock = new Mock<ILivenessDetectionService>();
        _loggerMock = new Mock<ILogger<EnrollFaceCommandHandler>>();

        _unitOfWorkMock.Setup(u => u.Repository<FaceProfile>()).Returns(_faceProfileRepoMock.Object);

        _enrollHandler = new EnrollFaceCommandHandler(
            _unitOfWorkMock.Object,
            _embeddingServiceMock.Object,
            _qualityServiceMock.Object,
            _livenessServiceMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task EnrollFaceCommand_LivenessFailed_ReturnsLivenessError()
    {
        // Arrange
        _livenessServiceMock.Setup(l => l.DetectLivenessAsync(It.IsAny<byte[]>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(false));

        var command = new EnrollFaceCommand(Guid.NewGuid(), new byte[] { 1, 2, 3 });

        // Act
        var result = await _enrollHandler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("SECURITY.FACE.LIVENESS_FAILED");
    }

    [Fact]
    public async Task EnrollFaceCommand_QualityScoreLow_ReturnsQualityError()
    {
        // Arrange
        _livenessServiceMock.Setup(l => l.DetectLivenessAsync(It.IsAny<byte[]>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(true));

        _qualityServiceMock.Setup(q => q.ValidateQualityAsync(It.IsAny<byte[]>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(0.50f)); // Below 0.70 threshold!

        var command = new EnrollFaceCommand(Guid.NewGuid(), new byte[] { 1, 2, 3 });

        // Act
        var result = await _enrollHandler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("SECURITY.FACE.QUALITY_CHECK_FAILED");
    }

    [Fact]
    public async Task EnrollFaceCommand_ValidImage_EnrollsSuccessfully()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _livenessServiceMock.Setup(l => l.DetectLivenessAsync(It.IsAny<byte[]>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(true));

        _qualityServiceMock.Setup(q => q.ValidateQualityAsync(It.IsAny<byte[]>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(0.90f));

        var embedding = new FaceEmbedding("vector_123", 512, "v1.0", 0.90f);
        _embeddingServiceMock.Setup(e => e.GenerateEmbeddingAsync(It.IsAny<byte[]>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(embedding));

        _faceProfileRepoMock.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<FaceProfile, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<FaceProfile>());

        var command = new EnrollFaceCommand(userId, new byte[] { 1, 2, 3 });

        // Act
        var result = await _enrollHandler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
    }
}
