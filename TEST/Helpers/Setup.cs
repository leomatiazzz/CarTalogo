using System.Net.Http.Headers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using MinimalAPI.Domain.Entities;
using MinimalAPI.Domain.Interfaces;
using TEST.Mocks;

namespace TEST.Helpers;

public class Setup
{
    public const string PORT = "5231";
    public static TestContext testContext = default!;
    public static WebApplicationFactory<Program> http = default!;
    public static HttpClient client = default!;

    public static void ClassInit(TestContext testContext)
    {
        Setup.testContext = testContext;
        Setup.http = new WebApplicationFactory<Program>();

        Setup.http = Setup.http.WithWebHostBuilder(builder =>
        {
            builder.UseSetting("https_port", Setup.PORT).UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                services.AddScoped<IAdminService, AdminServiceMock>();
                services.AddScoped<IVehicleService, VehicleServiceMock>();
            });
        });

        Setup.client = Setup.http.CreateClient();
    }

    public static string GetToken(string email, string profile)
    {
        using var scope = http.Services.CreateScope();
        var tokenService = scope.ServiceProvider.GetRequiredService<ITokenService>();
        return tokenService.GenerateToken(new Admin
        {
            Email = email,
            Profile = profile
        });
    }

    public static HttpClient CreateAuthenticatedClient(string role = "Admin")
    {
        var authenticatedClient = http.CreateClient();
        var token = GetToken($"{role.ToLower()}@teste.com", role);
        authenticatedClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return authenticatedClient;
    }

    public static void ClassCleanup()
    {
        Setup.http?.Dispose();
        Setup.client?.Dispose();
    }
}
