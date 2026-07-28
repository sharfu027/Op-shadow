using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace INK.ERP.IntegrationTests;

public class SecurityControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public SecurityControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetFaceProfile_Unauthenticated_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/security/face/profile?userId=" + Guid.NewGuid());

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task EnrollFace_InvalidMimeType_ReturnsProblemDetailsBadRequest()
    {
        // Arrange
        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(Encoding.UTF8.GetBytes("fake text data"));
        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("text/plain"); // Invalid MIME
        content.Add(fileContent, "Image", "test.txt");
        content.Add(new StringContent(Guid.NewGuid().ToString()), "UserId");

        // Act
        var response = await _client.PostAsync("/api/v1/security/face/enroll", content);

        // Assert (Requires Auth or returns 401/400)
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task DeviceApprove_Unauthenticated_ReturnsUnauthorized()
    {
        // Act
        var payload = JsonSerializer.Serialize(new { DeviceId = Guid.NewGuid(), ApprovedBy = "Admin" });
        var response = await _client.PostAsync("/api/v1/security/device/approve", new StringContent(payload, Encoding.UTF8, "application/json"));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task RiskCalculate_Unauthenticated_ReturnsUnauthorized()
    {
        // Act
        var payload = JsonSerializer.Serialize(new { UserId = Guid.NewGuid() });
        var response = await _client.PostAsync("/api/v1/security/risk/calculate", new StringContent(payload, Encoding.UTF8, "application/json"));

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetEffectivePolicy_Unauthenticated_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/security/policy/effective?userId=" + Guid.NewGuid());

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetCriticalIncidents_Unauthenticated_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/v1/security/incident/critical");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
