using Microsoft.EntityFrameworkCore;
using MinimalAPI.Domain.Entities;
using MinimalAPI.Domain.Interfaces;
using MinimalAPI.Infrastructure.Db;

namespace MinimalAPI.Domain.Services;

public class VehicleService : IVehicleService
{
    private readonly DbContexto _context;

    public VehicleService(DbContexto contexto)
    {
        _context = contexto;
    }

    public async Task<List<Vehicle>> AllAsync(int? page = 1, int itemsPerPage = 10, string? name = null, string? brand = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Vehicles.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
        {
            query = query.Where(v => EF.Functions.Like(v.Name, $"%{name}%"));
        }

        if (!string.IsNullOrWhiteSpace(brand))
        {
            query = query.Where(v => EF.Functions.Like(v.Brand, $"%{brand}%"));
        }

        var targetPage = Math.Max(1, page ?? 1);
        query = query.Skip((targetPage - 1) * itemsPerPage).Take(itemsPerPage);

        return await query.ToListAsync(cancellationToken);
    }

    public List<Vehicle> All(int? page = 1, string? name = null, string? brand = null)
    {
        var query = _context.Vehicles.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
        {
            query = query.Where(v => EF.Functions.Like(v.Name, $"%{name}%"));
        }

        if (!string.IsNullOrWhiteSpace(brand))
        {
            query = query.Where(v => EF.Functions.Like(v.Brand, $"%{brand}%"));
        }

        int itemsPerPage = 10;
        var targetPage = Math.Max(1, page ?? 1);
        query = query.Skip((targetPage - 1) * itemsPerPage).Take(itemsPerPage);

        return query.ToList();
    }

    public async Task CreateAsync(Vehicle vehicle, CancellationToken cancellationToken = default)
    {
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public void Create(Vehicle vehicle)
    {
        _context.Vehicles.Add(vehicle);
        _context.SaveChanges();
    }

    public async Task DeleteAsync(Vehicle vehicle, CancellationToken cancellationToken = default)
    {
        _context.Vehicles.Remove(vehicle);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public void Delete(Vehicle vehicle)
    {
        _context.Vehicles.Remove(vehicle);
        _context.SaveChanges();
    }

    public async Task<Vehicle?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Vehicles
            .AsNoTracking()
            .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
    }

    public Vehicle? GetById(int id)
    {
        return _context.Vehicles
            .AsNoTracking()
            .FirstOrDefault(v => v.Id == id);
    }

    public async Task UpdateAsync(Vehicle vehicle, CancellationToken cancellationToken = default)
    {
        _context.Vehicles.Update(vehicle);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public void Update(Vehicle vehicle)
    {
        _context.Vehicles.Update(vehicle);
        _context.SaveChanges();
    }
}
