using System.ComponentModel.DataAnnotations;

namespace DTOs;

public class UpdateUsernameRequest
{
    [Required]
    [StringLength(12, MinimumLength = 1)]
    public required string Username { get; set;}
}