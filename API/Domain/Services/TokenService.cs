using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MinimalAPI.Domain.Entities;
using MinimalAPI.Domain.Interfaces;

namespace MinimalAPI.Domain.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(Admin admin)
    {
        var key = _configuration["Jwt:Key"] 
                  ?? _configuration.GetValue<string>("Jwt") 
                  ?? "MINIMAL_API_SUPER_SECRET_KEY_FOR_SIGNING_TOKENS_2026_CHANGE_IN_PRODUCTION!";
        var issuer = _configuration["Jwt:Issuer"] ?? "MinimalAPI";
        var audience = _configuration["Jwt:Audience"] ?? "MinimalAPIClient";

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new("Email", admin.Email),
            new("Profile", admin.Profile),
            new(ClaimTypes.Role, admin.Profile)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
