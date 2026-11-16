using Microsoft.EntityFrameworkCore;
using MinimalAPI.Domain.Entities;

namespace MinimalAPI.Infrastructure.Db;

public class DbContexto : DbContext
{
    private readonly IConfiguration? _configurationAppSettings;

    public DbContexto(DbContextOptions<DbContexto> options, IConfiguration? configurationAppSettings = null) : base(options)
    {
        _configurationAppSettings = configurationAppSettings;
    }

    public DbContexto(IConfiguration configurationAppSettings)
    {
        _configurationAppSettings = configurationAppSettings;
    }

    public DbSet<Admin> Admins { get; set; } = default!;
    public DbSet<Vehicle> Vehicles { get; set; } = default!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasIndex(a => a.Email).IsUnique();
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasIndex(v => v.Name);
            entity.HasIndex(v => v.Brand);
        });

        modelBuilder.Entity<Admin>().HasData(
            new Admin
            {
                Id = 1,
                Email = "administrador@teste.com",
                Password = "123456",
                Profile = "Admin"
            }
        );
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured && _configurationAppSettings != null)
        {
            var stringConnection = _configurationAppSettings.GetConnectionString("MySql")?.ToString();
            if (!string.IsNullOrEmpty(stringConnection))
            {
                optionsBuilder.UseMySql(
                    stringConnection,
                    ServerVersion.AutoDetect(stringConnection)
                );
            }
        }
    }
}
