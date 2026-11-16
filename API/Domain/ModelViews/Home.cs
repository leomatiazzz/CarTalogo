namespace MinimalAPI.Domain.ModelViews;

public record Home
{
    public string Message => "Welcome to the Vehicle Management API / Bem-vindo a API Gerenciamento de Veículos";
    public string Documentation => "/swagger/index.html";
}
