using System.Net;
using System.Text;
using System.Text.Json;
using MinimalAPI.Domain.ModelViews;
using MinimalAPI.DTOs;
using TEST.Helpers;

namespace TEST.Requests;

[TestClass]
public sealed class VehicleRequestTest
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
    public async Task GetAllVehicles_WithoutAuthentication_Returns401Unauthorized()
    {
        // Act
        var response = await Setup.client.GetAsync("/vehicles");

        // Assert
        Assert.AreEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestMethod]
    public async Task GetAllVehicles_AsAuthenticatedUser_Returns200Ok()
    {
        // Arrange
        var client = Setup.CreateAuthenticatedClient("Editor");

        // Act
        var response = await client.GetAsync("/vehicles");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var vehicles = JsonSerializer.Deserialize<List<VehicleModelView>>(content, jsonOptions);

        Assert.IsNotNull(vehicles);
        Assert.IsTrue(vehicles.Count > 0);
    }

    [TestMethod]
    public async Task GetVehicleById_WhenExists_Returns200Ok()
    {
        // Arrange
        var client = Setup.CreateAuthenticatedClient("Editor");

        // Act
        var response = await client.GetAsync("/vehicles/1");

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();
        var vehicle = JsonSerializer.Deserialize<VehicleModelView>(content, jsonOptions);

        Assert.IsNotNull(vehicle);
        Assert.AreEqual(1, vehicle.Id);
        Assert.AreEqual("Fiesta", vehicle.Name);
    }

    [TestMethod]
    public async Task GetVehicleById_WhenNotFound_Returns404NotFound()
    {
        // Arrange
        var client = Setup.CreateAuthenticatedClient("Admin");

        // Act
        var response = await client.GetAsync("/vehicles/9999");

        // Assert
        Assert.AreEqual(HttpStatusCode.NotFound, response.StatusCode);
    }

    [TestMethod]
    public async Task CreateVehicle_WithValidData_Returns201Created()
    {
        // Arrange
        var client = Setup.CreateAuthenticatedClient("Editor");
        var dto = new VehicleDTO
        {
            Name = "Corolla",
            Brand = "Toyota",
            Year = 2022
        };

        var content = new StringContent(JsonSerializer.Serialize(dto), Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/vehicles", content);

        // Assert
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        Assert.IsNotNull(response.Headers.Location);

        var responseBody = await response.Content.ReadAsStringAsync();
        var created = JsonSerializer.Deserialize<VehicleModelView>(responseBody, jsonOptions);

        Assert.IsNotNull(created);
        Assert.AreEqual("Corolla", created.Name);
        Assert.AreEqual("Toyota", created.Brand);
    }

    [TestMethod]
    public async Task CreateVehicle_WithInvalidYear_Returns400BadRequest()
    {
        // Arrange
        var client = Setup.CreateAuthenticatedClient("Editor");
        var dto = new VehicleDTO
        {
            Name = "Fusca",
            Brand = "Volkswagen",
            Year = 1800 // Invalido (< 1886)
        };

        var content = new StringContent(JsonSerializer.Serialize(dto), Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/vehicles", content);

        // Assert
        Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [TestMethod]
    public async Task CreateVehicle_WithMissingFields_Returns400BadRequest()
    {
        // Arrange
        var client = Setup.CreateAuthenticatedClient("Editor");
        var dto = new VehicleDTO
        {
            Name = "",
            Brand = "",
            Year = 2020
        };

        var content = new StringContent(JsonSerializer.Serialize(dto), Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/vehicles", content);

        // Assert
        Assert.AreEqual(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [TestMethod]
    public async Task UpdateVehicle_AsAdmin_Returns200Ok()
    {
        // Arrange
        var client = Setup.CreateAuthenticatedClient("Admin");
        var dto = new VehicleDTO
        {
            Name = "Fiesta Sedan",
            Brand = "Ford",
            Year = 2014
        };

        var content = new StringContent(JsonSerializer.Serialize(dto), Encoding.UTF8, "application/json");

        // Act
        var response = await client.PutAsync("/vehicles/1", content);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
    }

    [TestMethod]
    public async Task UpdateVehicle_AsEditor_Returns403Forbidden()
    {
        // Arrange - Editor nao tem permissao para atualizar veículos
        var client = Setup.CreateAuthenticatedClient("Editor");
        var dto = new VehicleDTO
        {
            Name = "Fiesta Sedan",
            Brand = "Ford",
            Year = 2014
        };

        var content = new StringContent(JsonSerializer.Serialize(dto), Encoding.UTF8, "application/json");

        // Act
        var response = await client.PutAsync("/vehicles/1", content);

        // Assert
        Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [TestMethod]
    public async Task DeleteVehicle_AsAdmin_Returns204NoContent()
    {
        // Arrange
        var client = Setup.CreateAuthenticatedClient("Admin");

        // Act
        var response = await client.DeleteAsync("/vehicles/2");

        // Assert
        Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);
    }

    [TestMethod]
    public async Task DeleteVehicle_AsEditor_Returns403Forbidden()
    {
        // Arrange - Editor nao tem permissao para deletar veículos
        var client = Setup.CreateAuthenticatedClient("Editor");

        // Act
        var response = await client.DeleteAsync("/vehicles/1");

        // Assert
        Assert.AreEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
