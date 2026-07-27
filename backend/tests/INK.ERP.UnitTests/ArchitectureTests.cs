using System.Reflection;
using FluentAssertions;
using Xunit;

namespace INK.ERP.UnitTests;

public sealed class ArchitectureTests
{
    [Fact]
    public void DomainLayer_ShouldNot_DependOnApplicationOrInfrastructure()
    {
        // Arrange
        var domainAssembly = Assembly.Load("INK.ERP.Domain");

        // Act
        var referencedAssemblies = domainAssembly.GetReferencedAssemblies();

        // Assert
        referencedAssemblies.Should().NotContain(a => a.Name == "INK.ERP.Application");
        referencedAssemblies.Should().NotContain(a => a.Name == "INK.ERP.Infrastructure");
    }

    [Fact]
    public void ApplicationLayer_ShouldNot_DependOnInfrastructure()
    {
        // Arrange
        var applicationAssembly = Assembly.Load("INK.ERP.Application");

        // Act
        var referencedAssemblies = applicationAssembly.GetReferencedAssemblies();

        // Assert
        referencedAssemblies.Should().NotContain(a => a.Name == "INK.ERP.Infrastructure");
    }
}
