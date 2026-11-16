namespace MinimalAPI.Domain.ModelViews;

public record VehicleModelView
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Brand { get; set; } = default!;
    public int Year { get; set; }
}
