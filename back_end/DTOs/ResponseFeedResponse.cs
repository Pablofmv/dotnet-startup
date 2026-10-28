namespace DTOs;

public class ResponseFeedResponse
{
    public List<ResponseItemResponse> Responses { get; set;} = [];
    public int Page { get; set;}
    public int TotalPages {get; set;}
}