using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MinimalAPI.Domain.Entities;
using MinimalAPI.Domain.Interfaces;
using MinimalAPI.Domain.ModelViews;
using MinimalAPI.DTOs;

namespace MinimalAPI.Endpoints;

public static class VehicleEndpoints
{
    public static IEndpointRouteBuilder MapVehicleEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/vehicles").WithTags("Vehicles");

        group.MapPost("/", async ([FromBody] VehicleDTO vehicleDTO, IVehicleService vehicleService, CancellationToken ct) =>
        {
            var validation = ValidateVehicleDTO(vehicleDTO);
            if (validation.Messages.Count > 0)
                return Results.BadRequest(validation);

            var vehicle = new Vehicle
            {
                Name = vehicleDTO.Name,
                Brand = vehicleDTO.Brand,
                Year = vehicleDTO.Year
            };

            await vehicleService.CreateAsync(vehicle, ct);

            var response = new VehicleModelView
            {
                Id = vehicle.Id,
                Name = vehicle.Name,
                Brand = vehicle.Brand,
                Year = vehicle.Year
            };

            return Results.Created($"/vehicles/{vehicle.Id}", response);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin,Editor" });

        group.MapGet("/", async ([FromQuery] int? page, [FromQuery] string? name, [FromQuery] string? brand, IVehicleService vehicleService, CancellationToken ct) =>
        {
            var vehicles = await vehicleService.AllAsync(page, 10, name, brand, ct);
            var response = vehicles.Select(v => new VehicleModelView
            {
                Id = v.Id,
                Name = v.Name,
                Brand = v.Brand,
                Year = v.Year
            }).ToList();

            return Results.Ok(response);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin,Editor" });

        group.MapGet("/{id:int}", async ([FromRoute] int id, IVehicleService vehicleService, CancellationToken ct) =>
        {
            var vehicle = await vehicleService.GetByIdAsync(id, ct);
            if (vehicle == null)
                return Results.NotFound();

            var response = new VehicleModelView
            {
                Id = vehicle.Id,
                Name = vehicle.Name,
                Brand = vehicle.Brand,
                Year = vehicle.Year
            };

            return Results.Ok(response);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin,Editor" });

        group.MapPut("/{id:int}", async ([FromRoute] int id, [FromBody] VehicleDTO vehicleDTO, IVehicleService vehicleService, CancellationToken ct) =>
        {
            var vehicle = await vehicleService.GetByIdAsync(id, ct);
            if (vehicle == null)
                return Results.NotFound();

            var validation = ValidateVehicleDTO(vehicleDTO);
            if (validation.Messages.Count > 0)
                return Results.BadRequest(validation);

            vehicle.Name = vehicleDTO.Name;
            vehicle.Brand = vehicleDTO.Brand;
            vehicle.Year = vehicleDTO.Year;

            await vehicleService.UpdateAsync(vehicle, ct);

            var response = new VehicleModelView
            {
                Id = vehicle.Id,
                Name = vehicle.Name,
                Brand = vehicle.Brand,
                Year = vehicle.Year
            };

            return Results.Ok(response);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" });

        group.MapDelete("/{id:int}", async ([FromRoute] int id, IVehicleService vehicleService, CancellationToken ct) =>
        {
            var vehicle = await vehicleService.GetByIdAsync(id, ct);
            if (vehicle == null)
                return Results.NotFound();

            await vehicleService.DeleteAsync(vehicle, ct);
            return Results.NoContent();
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" });

        return app;
    }

    private static ValidationErrors ValidateVehicleDTO(VehicleDTO vehicleDTO)
    {
        var validation = new ValidationErrors();

        if (string.IsNullOrWhiteSpace(vehicleDTO.Name))
            validation.Messages.Add("The Name field is required. / O campo Nome é obrigatório.");

        if (string.IsNullOrWhiteSpace(vehicleDTO.Brand))
            validation.Messages.Add("The Brand field is required. / O campo Marca é obrigatório.");

        if (vehicleDTO.Year < 1886 || vehicleDTO.Year > DateTime.Now.Year + 1)
            validation.Messages.Add($"The Year field must be between 1886 and {DateTime.Now.Year + 1}. / O campo Ano deve estar entre 1886 e {DateTime.Now.Year + 1}.");

        return validation;
    }
}
