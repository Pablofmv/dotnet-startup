using System.ComponentModel.DataAnnotations;

namespace DTOs;

public class CreateResponseRequest
{
    [Required]
    public required string Body {get; set;}
}