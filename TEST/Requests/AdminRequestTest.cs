using System.Net;
using System.Text;
using System.Text.Json;
using MinimalAPI.Domain.Enums;
using MinimalAPI.Domain.ModelViews;
using MinimalAPI.DTOs;
using TEST.Helpers;

namespace TEST.Requests;

[TestClass]
public sealed class AdminRequestTest
{
    private static readonly JsonSerializerOptions jsonOptions = new() { PropertyNameCaseInsensitive = true };

    [ClassInitialize]
    public static void ClassInit(TestContext testContext)
    {
        Setup.ClassInit(testContext);
    }

    [ClassCleanup]
    public static void ClassCleanup()
    {
        Setup.ClassCleanup();
    }

    [TestMethod]
    public async Task HealthCheck_Returns200Ok()
    {
        // Act
        var response = await Setup.client.GetAsync("/health");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
    }

    [TestMethod]
    public async Task Login_WithValidCredentials_ReturnsOkAndToken()
    {
        // Arrange
        var loginDTO = new LoginDTO
        {
            Email = "adm@teste.com",
            Password = "123456"
        };

        var content = new StringContent(JsonSerializer.Serialize(loginDTO), Encoding.UTF8, "application/json");

        // Act
        var response = await Setup.client.PostAsync("/admins/login", content);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadAsStringAsync();
        var admLoggedIn = JsonSerializer.Deserialize<AdminLoggedIn>(result, jsonOptions);

        Assert.IsNotNull(admLoggedIn);
        Assert.IsFalse(string.IsNullOrEmpty(admLoggedIn.Email));
        Assert.IsFalse(string.IsNullOrEmpty(admLoggedIn.Profile));
        Assert.IsFalse(string.IsNullOrEmpty(admLoggedIn.Token));
    }

    [TestMethod]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var loginDTO = new LoginDTO
        {
            Email = "adm@teste.com",
            Password = "wrong_password"
        };

        var content = new StringContent(JsonSerializer.Serialize(loginDTO), Encoding.UTF8, "application/json");

        // Act
        var response = await Setup.client.PostAsync("/admins/login", content);

        // Assert
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task GetAllAdmins_AsAdmin_Returns200Ok()
    {
        // Arrange
        var client = Setup.CreateAuthenticatedClient("Admin");

        // Act
        var response = await client.GetAsync("/admins");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var admins = JsonSerializer.Deserialize<List<AdminModelView>>(content, jsonOptions);

        Assert.IsNotNull(admins);
        Assert.IsTrue(admins.Count > 0);
    }

    [TestMethod]
    public async Task GetAllAdmins_AsEditor_Returns403Forbidden()
    {
        // Arrange - Editor não tem permissão de visualizar administradores
        var client = Setup.CreateAuthenticatedClient("Editor");

        // Act
        var response = await client.GetAsync("/admins");

        // Assert
        Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [TestMethod]
    public async Task CreateAdmin_AsAdmin_Returns201Created()
    {
        // Arrange
        var client = Setup.CreateAuthenticatedClient("Admin");
        var dto = new AdminDTO
        {
            Email = $"novo_adm_{Guid.NewGuid()}@teste.com",
            Password = "senha_segura_123",
            Profile = Profile.Admin
        };

        var content = new StringContent(JsonSerializer.Serialize(dto), Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/admins", content);

        // Assert
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        Assert.IsNotNull(response.Headers.Location);
    }

    [TestMethod]
    public async Task CreateAdmin_AsEditor_Returns403Forbidden()
    {
        // Arrange
        var client = Setup.CreateAuthenticatedClient("Editor");
        var dto = new AdminDTO
        {
            Email = "tentativa@teste.com",
            Password = "senha",
            Profile = Profile.Editor
        };

        var content = new StringContent(JsonSerializer.Serialize(dto), Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/admins", content);

        // Assert
        Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
