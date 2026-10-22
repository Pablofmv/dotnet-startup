using System.ComponentModel.DataAnnotations;

namespace DTOs;

public class RegisterRequest
{

    [Required]
    [EmailAddress]
    public required string Email {get; set;}

    [Required]
    [MinLength(8)]
    public required string Password {get; set;}

    public Guid CommunityId {get; set;}

    public Guid ResidenceId {get; set;}

    public string? Address {get; set;}
}