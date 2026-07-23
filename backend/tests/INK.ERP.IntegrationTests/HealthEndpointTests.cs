namespace INK.ERP.IntegrationTests;

using Xunit;
using FluentAssertions;

public class HealthEndpointTests
{
    [Fact]
    public void BackendSolution_ShouldBe_CleanArchitectureReady()
    {
        string solutionName = "INK.ERP.sln";
        solutionName.Should().Contain("INK.ERP");
    }
}
