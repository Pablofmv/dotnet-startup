namespace DTOs;

public class CurrentUserResponse
{
    public Guid Id {get; set;}

    public required string Username {get; set;}

    public required string Email {get; set;}

    public Guid CommunityId {get; set;}

    public Guid ResidenceId {get; set;}
}