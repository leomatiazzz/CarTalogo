using MinimalAPI.Domain.Entities;

namespace MinimalAPI.Domain.Interfaces;

public interface IVehicleService
{
    Task<List<Vehicle>> AllAsync(int? page = 1, int itemsPerPage = 10, string? name = null, string? brand = null, CancellationToken cancellationToken = default);
    Task<Vehicle?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task CreateAsync(Vehicle vehicle, CancellationToken cancellationToken = default);
    Task UpdateAsync(Vehicle vehicle, CancellationToken cancellationToken = default);
    Task DeleteAsync(Vehicle vehicle, CancellationToken cancellationToken = default);

    List<Vehicle> All(int? page = 1, string? name = null, string? brand = null);
    Vehicle? GetById(int id);
    void Create(Vehicle vehicle);
    void Update(Vehicle vehicle);
    void Delete(Vehicle vehicle);
}
