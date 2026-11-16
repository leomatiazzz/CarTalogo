using MinimalAPI.Domain.Entities;
using MinimalAPI.Domain.Interfaces;

namespace TEST.Mocks;

public class VehicleServiceMock : IVehicleService
{
    private static readonly List<Vehicle> vehicles = new()
    {
        new Vehicle
        {
            Id = 1,
            Name = "Fiesta",
            Brand = "Ford",
            Year = 2013
        },
        new Vehicle
        {
            Id = 2,
            Name = "Civic",
            Brand = "Honda",
            Year = 2020
        }
    };

    public Task<List<Vehicle>> AllAsync(int? page = 1, int itemsPerPage = 10, string? name = null, string? brand = null, CancellationToken cancellationToken = default)
    {
        var query = vehicles.AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(v => v.Name.Contains(name, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(brand))
            query = query.Where(v => v.Brand.Contains(brand, StringComparison.OrdinalIgnoreCase));

        var targetPage = Math.Max(1, page ?? 1);
        var result = query.Skip((targetPage - 1) * itemsPerPage).Take(itemsPerPage).ToList();

        return Task.FromResult(result);
    }

    public List<Vehicle> All(int? page = 1, string? name = null, string? brand = null)
    {
        return AllAsync(page, 10, name, brand).GetAwaiter().GetResult();
    }

    public Task<Vehicle?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var vehicle = vehicles.FirstOrDefault(v => v.Id == id);
        return Task.FromResult(vehicle);
    }

    public Vehicle? GetById(int id)
    {
        return vehicles.FirstOrDefault(v => v.Id == id);
    }

    public Task CreateAsync(Vehicle vehicle, CancellationToken cancellationToken = default)
    {
        vehicle.Id = vehicles.Count > 0 ? vehicles.Max(v => v.Id) + 1 : 1;
        vehicles.Add(vehicle);
        return Task.CompletedTask;
    }

    public void Create(Vehicle vehicle)
    {
        CreateAsync(vehicle).GetAwaiter().GetResult();
    }

    public Task UpdateAsync(Vehicle vehicle, CancellationToken cancellationToken = default)
    {
        var index = vehicles.FindIndex(v => v.Id == vehicle.Id);
        if (index >= 0)
        {
            vehicles[index] = vehicle;
        }
        return Task.CompletedTask;
    }

    public void Update(Vehicle vehicle)
    {
        UpdateAsync(vehicle).GetAwaiter().GetResult();
    }

    public Task DeleteAsync(Vehicle vehicle, CancellationToken cancellationToken = default)
    {
        vehicles.RemoveAll(v => v.Id == vehicle.Id);
        return Task.CompletedTask;
    }

    public void Delete(Vehicle vehicle)
    {
        DeleteAsync(vehicle).GetAwaiter().GetResult();
    }
}
