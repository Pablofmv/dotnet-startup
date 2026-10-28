using System.ComponentModel.DataAnnotations;

namespace DTOs;

public class CreateResponseRequest
{
    [Required]
    [StringLength(180)]
    public required string Body {get; set;}
}