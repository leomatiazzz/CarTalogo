using MinimalAPI.Domain.Entities;
using MinimalAPI.Domain.Services;

namespace TEST.Domain.Entities;

[TestClass]
public sealed class AdminTest
{
    [TestMethod]
    public void TestGetSetProperties()
    {
        // Arrange
        var adm = new Admin();

        //Act
        adm.Id = 1;
        adm.Email = "teste@teste.com";
        adm.Password = "teste";
        adm.Profile = "Admin";

        //Assert
        Assert.AreEqual(1, adm.Id);
        Assert.AreEqual("teste@teste.com", adm.Email);
        Assert.AreEqual("teste", adm.Password);
        Assert.AreEqual("Admin", adm.Profile);
    }

    [TestMethod]
    public void TestPasswordHashing()
    {
        var passwordService = new PasswordService();
        var hash = passwordService.HashPassword("123456");
        Assert.IsFalse(string.IsNullOrEmpty(hash));
        Assert.IsTrue(passwordService.VerifyPassword(hash, "123456"));
        Assert.IsFalse(passwordService.VerifyPassword(hash, "wrong_password"));
    }
}

