using System.ComponentModel.DataAnnotations;

namespace Models;

public class Response
{
    [Key]
    public Guid Id {get; set;}

    public required string Body {get; set;}

    public Guid UserId {get; set;}

    public User User {get; set;} = null!;

    public Guid QuestionId {get; set;}

    public Question Question {get; set;} = null!;

    public DateTime CreatedAt {get; set;}
}