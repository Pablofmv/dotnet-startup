using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Models;

[Index(nameof(Email), IsUnique = true)]
public class User
{
    [Key]
    public Guid Id {get; set;}

    public string Username {get; set;} = "Anonymous";

    public required string Email {get; set;}

    public required string PasswordHash {get; set;}

    public Guid CommunityId {get; set;}

    public Community Community {get; set;} = null!;

    public Guid ResidenceId {get; set;}

    public Residence Residence {get; set;} = null!;

    public DateTime CreatedAt {get; set;}
}