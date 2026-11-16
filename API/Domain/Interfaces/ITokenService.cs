using MinimalAPI.Domain.Entities;

namespace MinimalAPI.Domain.Interfaces;

public interface ITokenService
{
    string GenerateToken(Admin admin);
}
