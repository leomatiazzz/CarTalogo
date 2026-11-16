using MinimalAPI.Domain.Entities;
using MinimalAPI.DTOs;

namespace MinimalAPI.Domain.Interfaces;

public interface IAdminService
{
    Task<Admin?> LoginAsync(LoginDTO loginDTO, CancellationToken cancellationToken = default);
    Task<Admin> CreateAsync(Admin admin, CancellationToken cancellationToken = default);
    Task<Admin?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<Admin>> AllAsync(int? page = 1, int itemsPerPage = 10, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);

    Admin? Login(LoginDTO loginDTO);
    Admin Create(Admin admin);
    Admin? GetById(int id);
    List<Admin> All(int? page);
}
