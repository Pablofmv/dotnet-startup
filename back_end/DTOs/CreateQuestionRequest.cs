using System.ComponentModel.DataAnnotations;

namespace DTOs;

public class CreateQuestionRequest
{
    [Required]
    [StringLength(130)]
    public required string QuestionText {get; set;}

    public Guid CategoryId {get; set;}
}