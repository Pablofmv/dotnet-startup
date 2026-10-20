using Data;
using Microsoft.EntityFrameworkCore;

namespace Services;

public class ResponseService
{
    private readonly AppDbContext _dbContext;

    public ResponseService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> DeleteResponseAsync(
        Guid questionId,
        Guid responseId,
        Guid userId
    )
    {
        var deletedCount = await _dbContext.Responses 
            .Where( r => r.Id == responseId && r.QuestionId == questionId && r.UserId == userId)
            .ExecuteDeleteAsync();
        
        return deletedCount > 0;
    }
}

