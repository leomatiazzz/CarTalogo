using MinimalAPI.Domain.ModelViews;

namespace MinimalAPI.Endpoints;

public static class HomeEndpoints
{
    public static IEndpointRouteBuilder MapHomeEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/", () => Results.Json(new Home()))
            .AllowAnonymous()
            .WithTags("Home");

        return app;
    }
}
