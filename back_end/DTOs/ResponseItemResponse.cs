namespace DTOs;

public class ResponseItemResponse
{
    public Guid Id {get; set;}

    public required string Body {get; set;}

    public DateTime CreatedAt {get; set;}

    public bool CanDelete {get; set;}

    public required string Username {get; set;}
}