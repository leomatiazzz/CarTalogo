using Microsoft.EntityFrameworkCore;
using MinimalAPI.Domain.Entities;
using MinimalAPI.Domain.Services;
using MinimalAPI.Infrastructure.Db;

namespace TEST.Domain.Entities;

[TestClass]
public sealed class AdminServiceTest
{
    private static DbContexto CreateTestContext()
    {
        var options = new DbContextOptionsBuilder<DbContexto>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new DbContexto(options);
    }

    [TestMethod]
    public async Task GetByIdTest()
    {
        // Arrange
        using var context = CreateTestContext();

        var adm = new Admin
        {
            Email = "teste@teste.com",
            Password = "teste",
            Profile = "Admin"
        };

        var adminService = new AdminService(context);

        // Act
        await adminService.CreateAsync(adm);
        var admFromDB = await adminService.GetByIdAsync(adm.Id);

        // Assert
        Assert.IsNotNull(admFromDB);
        Assert.AreEqual(adm.Id, admFromDB.Id);
        Assert.AreEqual("teste@teste.com", admFromDB.Email);
    }

    [TestMethod]
    public async Task All_Pagination_ReturnsCorrectItems()
    {
        // Arrange
        using var context = CreateTestContext();
        var adminService = new AdminService(context);

        for (int i = 1; i <= 15; i++)
        {
            await adminService.CreateAsync(new Admin
            {
                Email = $"admin{i}@teste.com",
                Password = "pwd",
                Profile = "Admin"
            });
        }

        // Act
        var page1 = await adminService.AllAsync(1, 10);
        var page2 = await adminService.AllAsync(2, 10);

        // Assert
        Assert.AreEqual(10, page1.Count);
        Assert.AreEqual(5, page2.Count);
    }

    [TestMethod]
    public async Task Login_WithValidPassword_ReturnsAdmin()
    {
        // Arrange
        using var context = CreateTestContext();
        var adminService = new AdminService(context);

        await adminService.CreateAsync(new Admin
        {
            Email = "login_test@teste.com",
            Password = "correct_password",
            Profile = "Admin"
        });

        // Act
        var result = await adminService.LoginAsync(new MinimalAPI.DTOs.LoginDTO
        {
            Email = "login_test@teste.com",
            Password = "correct_password"
        });

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual("login_test@teste.com", result.Email);
    }
}
