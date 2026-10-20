namespace DTOs;

public class QuestionFeedResponse
{
    public List<QuestionFeedItemResponse> Questions {get; set;} = [];

    public int Page {get; set;}

    public int PageSize {get; set;}

    public bool HasNextPage {get; set;}

    public bool HasPreviousPage {get; set;}
}