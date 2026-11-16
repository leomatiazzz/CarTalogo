using Microsoft.EntityFrameworkCore;
using MinimalAPI.Domain.Entities;
using MinimalAPI.Domain.Services;
using MinimalAPI.Infrastructure.Db;

namespace TEST.Domain.Services;

[TestClass]
public sealed class VehicleServiceTest
{
    private static DbContexto CreateTestContext()
    {
        var options = new DbContextOptionsBuilder<DbContexto>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new DbContexto(options);
    }

    [TestMethod]
    public async Task CreateAndGetById_Success()
    {
        // Arrange
        using var context = CreateTestContext();
        var service = new VehicleService(context);

        var vehicle = new Vehicle
        {
            Name = "Gol",
            Brand = "Volkswagen",
            Year = 2021
        };

        // Act
        await service.CreateAsync(vehicle);
        var found = await service.GetByIdAsync(vehicle.Id);

        // Assert
        Assert.IsNotNull(found);
        Assert.AreEqual("Gol", found.Name);
        Assert.AreEqual("Volkswagen", found.Brand);
    }

    [TestMethod]
    public async Task FilterByNameAndBrand_ReturnsMatchingVehicles()
    {
        // Arrange
        using var context = CreateTestContext();
        var service = new VehicleService(context);

        await service.CreateAsync(new Vehicle { Name = "Onix", Brand = "Chevrolet", Year = 2020 });
        await service.CreateAsync(new Vehicle { Name = "Cruze", Brand = "Chevrolet", Year = 2022 });
        await service.CreateAsync(new Vehicle { Name = "Corolla", Brand = "Toyota", Year = 2021 });

        // Act
        var chevroletVehicles = await service.AllAsync(1, 10, brand: "Chevrolet");
        var onixVehicle = await service.AllAsync(1, 10, name: "Onix");

        // Assert
        Assert.AreEqual(2, chevroletVehicles.Count);
        Assert.AreEqual(1, onixVehicle.Count);
        Assert.AreEqual("Onix", onixVehicle[0].Name);
    }

    [TestMethod]
    public async Task Update_ModifiesVehicleData()
    {
        // Arrange
        using var context = CreateTestContext();
        var service = new VehicleService(context);

        var vehicle = new Vehicle { Name = "Ka", Brand = "Ford", Year = 2018 };
        await service.CreateAsync(vehicle);

        // Act
        vehicle.Name = "Ka Sedan";
        vehicle.Year = 2019;
        await service.UpdateAsync(vehicle);

        var updated = await service.GetByIdAsync(vehicle.Id);

        // Assert
        Assert.IsNotNull(updated);
        Assert.AreEqual("Ka Sedan", updated.Name);
        Assert.AreEqual(2019, updated.Year);
    }

    [TestMethod]
    public async Task Delete_RemovesVehicleFromDb()
    {
        // Arrange
        using var context = CreateTestContext();
        var service = new VehicleService(context);

        var vehicle = new Vehicle { Name = "Uno", Brand = "Fiat", Year = 2015 };
        await service.CreateAsync(vehicle);

        // Act
        await service.DeleteAsync(vehicle);
        var found = await service.GetByIdAsync(vehicle.Id);

        // Assert
        Assert.IsNull(found);
    }
}
