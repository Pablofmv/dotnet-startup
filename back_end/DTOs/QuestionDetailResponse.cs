namespace DTOs;

public class QuestionDetailResponse
{
    public Guid Id {get; set;}

    public required string QuestionText {get; set;}

    public Guid CategoryId {get; set;}

    public DateTime CreatedAt {get; set;}

    public bool CanDelete {get; set;}
}