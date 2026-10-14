using System.ComponentModel.DataAnnotations;

namespace Models;

public class Question
{
    [Key]
    public Guid Id {get; set;}

    [MaxLength(130)]
    public required string QuestionText {get; set;}

    public Guid UserId {get; set;}

    public User User {get; set;} = null!;

    public Guid CommunityId {get; set;}

    public Community Community {get; set;} = null!;

    public Guid ResidenceId {get; set;}

    public Residence Residence {get; set;} = null!;

    public Guid CategoryId {get; set;}

    public Category Category {get; set;} = null!;

    public DateTime CreatedAt {get; set;}

}