using MinimalAPI.Domain.Entities;
using MinimalAPI.Domain.Interfaces;
using MinimalAPI.DTOs;

namespace TEST.Mocks;

public class AdminServiceMock : IAdminService
{
    private static readonly List<Admin> admins = new List<Admin>()
    {
        new Admin
        {
            Id = 1,
            Email = "adm@teste.com",
            Password = "123456",
            Profile = "Admin"
        },
        new Admin
        {
            Id = 2,
            Email = "editor@teste.com",
            Password = "123456",
            Profile = "Editor"
        }
    };

    public Task<List<Admin>> AllAsync(int? page = 1, int itemsPerPage = 10, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(admins.ToList());
    }

    public List<Admin> All(int? page)
    {
        return admins.ToList();
    }

    public Task<Admin> CreateAsync(Admin admin, CancellationToken cancellationToken = default)
    {
        admin.Id = admins.Count + 1;
        admins.Add(admin);
        return Task.FromResult(admin);
    }

    public Admin Create(Admin admin)
    {
        admin.Id = admins.Count + 1;
        admins.Add(admin);
        return admin;
    }

    public Task<Admin?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(admins.Find(a => a.Id == id));
    }

    public Admin? GetById(int id)
    {
        return admins.Find(a => a.Id == id);
    }

    public Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(admins.Any(a => a.Email.Equals(email, StringComparison.OrdinalIgnoreCase)));
    }

    public Task<Admin?> LoginAsync(LoginDTO loginDTO, CancellationToken cancellationToken = default)
    {
        var adm = admins.Find(a => a.Email == loginDTO.Email && a.Password == loginDTO.Password);
        return Task.FromResult(adm);
    }

    public Admin? Login(LoginDTO loginDTO)
    {
        return admins.Find(a => a.Email == loginDTO.Email && a.Password == loginDTO.Password);
    }
}
