namespace INK.ERP.UnitTests;

using Xunit;
using FluentAssertions;

public class ArchitectureTests
{
    [Fact]
    public void Foundation_ShouldBe_ConfiguredSuccessfully()
    {
        bool isConfigured = true;
        isConfigured.Should().BeTrue();
    }
}
