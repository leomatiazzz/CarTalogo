using Microsoft.EntityFrameworkCore;
using MinimalAPI.Domain.Entities;
using MinimalAPI.Domain.Interfaces;
using MinimalAPI.DTOs;
using MinimalAPI.Infrastructure.Db;

namespace MinimalAPI.Domain.Services;

public class AdminService : IAdminService
{
    private readonly DbContexto _context;
    private readonly IPasswordService _passwordService;

    public AdminService(DbContexto contexto, IPasswordService? passwordService = null)
    {
        _context = contexto;
        _passwordService = passwordService ?? new PasswordService();
    }

    public async Task<List<Admin>> AllAsync(int? page = 1, int itemsPerPage = 10, CancellationToken cancellationToken = default)
    {
        var targetPage = Math.Max(1, page ?? 1);
        return await _context.Admins
            .AsNoTracking()
            .Skip((targetPage - 1) * itemsPerPage)
            .Take(itemsPerPage)
            .ToListAsync(cancellationToken);
    }

    public List<Admin> All(int? page)
    {
        var targetPage = Math.Max(1, page ?? 1);
        int itemsPerPage = 10;
        return _context.Admins
            .AsNoTracking()
            .Skip((targetPage - 1) * itemsPerPage)
            .Take(itemsPerPage)
            .ToList();
    }

    public async Task<Admin?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Admins
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public Admin? GetById(int id)
    {
        return _context.Admins
            .AsNoTracking()
            .FirstOrDefault(a => a.Id == id);
    }
    
    public async Task<Admin> CreateAsync(Admin admin, CancellationToken cancellationToken = default)
    {
        admin.Password = _passwordService.HashPassword(admin.Password);
        _context.Admins.Add(admin);
        await _context.SaveChangesAsync(cancellationToken);
        return admin;
    }

    public Admin Create(Admin admin)
    {
        admin.Password = _passwordService.HashPassword(admin.Password);
        _context.Admins.Add(admin);
        _context.SaveChanges();
        return admin;
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Admins
            .AsNoTracking()
            .AnyAsync(a => a.Email.ToLower() == email.Trim().ToLower(), cancellationToken);
    }

    public async Task<Admin?> LoginAsync(LoginDTO loginDTO, CancellationToken cancellationToken = default)
    {
        var adm = await _context.Admins
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Email.ToLower() == loginDTO.Email.Trim().ToLower(), cancellationToken);

        if (adm == null) return null;

        if (_passwordService.VerifyPassword(adm.Password, loginDTO.Password) || adm.Password == loginDTO.Password)
        {
            return adm;
        }

        return null;
    }

    public Admin? Login(LoginDTO loginDTO)
    {
        var adm = _context.Admins
            .AsNoTracking()
            .FirstOrDefault(a => a.Email.ToLower() == loginDTO.Email.Trim().ToLower());

        if (adm == null) return null;

        if (_passwordService.VerifyPassword(adm.Password, loginDTO.Password) || adm.Password == loginDTO.Password)
        {
            return adm;
        }

        return null;
    }
}
