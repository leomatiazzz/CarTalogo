namespace MinimalAPI.Domain.ModelViews;

public record ValidationErrors
{
    public List<string> Messages { get; init; } = new();

    public ValidationErrors() { }

    public ValidationErrors(params string[] messages)
    {
        Messages = new List<string>(messages);
    }

    public ValidationErrors(IEnumerable<string> messages)
    {
        Messages = new List<string>(messages);
    }
}
