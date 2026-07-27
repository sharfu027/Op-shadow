using NetArchTest.Rules;
using FluentAssertions;
using Xunit;

namespace INK.ERP.UnitTests;

public sealed class ArchitectureTests
{
    private const string DomainNamespace = "INK.ERP.Domain";
    private const string ApplicationNamespace = "INK.ERP.Application";
    private const string InfrastructureNamespace = "INK.ERP.Infrastructure";
    private const string ApiNamespace = "INK.ERP.API";
    private const string SharedNamespace = "INK.ERP.Shared";

    [Fact]
    public void Domain_Should_NotHaveDependencyOnOtherProjects()
    {
        // Arrange
        var assembly = typeof(Domain.Common.BaseEntity).Assembly;

        // Act
        var result = Types.InAssembly(assembly)
            .ShouldNot()
            .HaveDependencyOnAny(
                ApplicationNamespace,
                InfrastructureNamespace,
                ApiNamespace)
            .GetResult();

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Application_Should_NotHaveDependencyOnInfrastructureOrApi()
    {
        // Arrange
        var assembly = typeof(Application.DependencyInjection).Assembly;

        // Act
        var result = Types.InAssembly(assembly)
            .ShouldNot()
            .HaveDependencyOnAny(
                InfrastructureNamespace,
                ApiNamespace)
            .GetResult();

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Infrastructure_Should_NotHaveDependencyOnApi()
    {
        // Arrange
        var assembly = typeof(Infrastructure.DependencyInjection).Assembly;

        // Act
        var result = Types.InAssembly(assembly)
            .ShouldNot()
            .HaveDependencyOnAny(ApiNamespace)
            .GetResult();

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Handlers_Should_HaveNameEndingWithHandler()
    {
        // Arrange
        var assembly = typeof(Application.DependencyInjection).Assembly;

        // Act
        var result = Types.InAssembly(assembly)
            .That()
            .ImplementInterface(typeof(MediatR.IRequestHandler<,>))
            .Should()
            .HaveNameEndingWith("Handler")
            .GetResult();

        // Assert
        result.IsSuccessful.Should().BeTrue();
    }
}
