using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MinimalAPI.Domain.Entities;
using MinimalAPI.Domain.Enums;
using MinimalAPI.Domain.Interfaces;
using MinimalAPI.Domain.ModelViews;
using MinimalAPI.DTOs;

namespace MinimalAPI.Endpoints;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/admins").WithTags("Admins");

        group.MapPost("/login", async ([FromBody] LoginDTO loginDTO, IAdminService adminService, ITokenService tokenService, CancellationToken ct) =>
        {
            var admin = await adminService.LoginAsync(loginDTO, ct);
            if (admin == null)
            {
                return Results.Unauthorized();
            }

            var token = tokenService.GenerateToken(admin);
            return Results.Ok(new AdminLoggedIn
            {
                Email = admin.Email,
                Profile = admin.Profile,
                Token = token
            });
        }).AllowAnonymous();

        group.MapGet("/", async ([FromQuery] int? page, IAdminService adminService, CancellationToken ct) =>
        {
            var admins = await adminService.AllAsync(page, 10, ct);
            var response = admins.Select(admin => new AdminModelView
            {
                Id = admin.Id,
                Email = admin.Email,
                Profile = admin.Profile
            }).ToList();

            return Results.Ok(response);
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" });

        group.MapGet("/{id:int}", async ([FromRoute] int id, IAdminService adminService, CancellationToken ct) =>
        {
            var admin = await adminService.GetByIdAsync(id, ct);
            if (admin == null)
            {
                return Results.NotFound();
            }

            return Results.Ok(new AdminModelView
            {
                Id = admin.Id,
                Email = admin.Email,
                Profile = admin.Profile
            });
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" });

        group.MapPost("/", async ([FromBody] AdminDTO adminDTO, IAdminService adminService, CancellationToken ct) =>
        {
            var validation = new ValidationErrors();

            if (string.IsNullOrWhiteSpace(adminDTO.Email))
                validation.Messages.Add("The Email field is required. / O campo Email é obrigatório.");
            if (string.IsNullOrWhiteSpace(adminDTO.Password))
                validation.Messages.Add("The Password field is required. / O campo Senha é obrigatório.");
            if (adminDTO.Profile == null)
                validation.Messages.Add("The Profile field is required. / O campo Perfil é obrigatório.");

            if (validation.Messages.Count > 0)
                return Results.BadRequest(validation);

            if (await adminService.ExistsByEmailAsync(adminDTO.Email, ct))
            {
                validation.Messages.Add("An admin with this email already exists. / Já existe um administrador com este email.");
                return Results.BadRequest(validation);
            }

            var admin = new Admin
            {
                Email = adminDTO.Email,
                Password = adminDTO.Password,
                Profile = adminDTO.Profile.ToString() ?? Profile.Editor.ToString()
            };

            await adminService.CreateAsync(admin, ct);

            return Results.Created($"/admins/{admin.Id}", new AdminModelView
            {
                Id = admin.Id,
                Email = admin.Email,
                Profile = admin.Profile
            });
        })
        .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" });

        return app;
    }
}
