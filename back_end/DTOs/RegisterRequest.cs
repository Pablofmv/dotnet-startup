namespace DTOs;

public class RegisterRequest
{
    public required string Email {get; set;}

    public required string Password {get; set;}

    public Guid CommunityId {get; set;}

    public Guid ResidenceId {get; set;}

    public string? Address {get; set;}
}