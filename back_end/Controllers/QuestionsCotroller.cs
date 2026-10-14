using Data;
using DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Security.Claims;



namespace Controllers;

[ApiController]
[Route("questions")]
public class QuestionsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public QuestionsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [Authorize]
    [EnableRateLimiting("create-question")]
    [HttpPost]
    public async Task<IActionResult> CreateQuestion(CreateQuestionRequest request)
    {
        
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var currentUser = await _dbContext.Users.AsNoTracking().Where(
            u => u.Id == userId
        ).Select(
            u => new 
            {
                u.Id,
                u.CommunityId,
                u.ResidenceId
            }
        )
        .FirstOrDefaultAsync();

        if (currentUser is null)
        {
            return Unauthorized();
        }

        var todayUtc = DateTime.UtcNow.Date;

        var questionsCreatedToday = await _dbContext.Questions.CountAsync(
            q => q.UserId == currentUser.Id && q.CreatedAt >= todayUtc
        );

        if (questionsCreatedToday >= 3)
        {
            return StatusCode(StatusCodes.Status429TooManyRequests, "Maximum 3 questions per day.");
        }

        var categoryExists = await _dbContext.Categories.AnyAsync(
            c => c.Id == request.CategoryId
        );

        if (!categoryExists)
        {
            return BadRequest("Invalid CategoryId");
        }

        var question = new Question
        {
            QuestionText = request.QuestionText,
            UserId = currentUser.Id,
            CommunityId = currentUser.CommunityId,
            ResidenceId = currentUser.ResidenceId,
            CategoryId = request.CategoryId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Questions.Add(question);

        await _dbContext.SaveChangesAsync();

        return StatusCode(
            StatusCodes.Status201Created,
            new { question.Id }
        );
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetQuestions([FromQuery] Guid? categoryId)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var currentUser = await _dbContext.Users.AsNoTracking().Where(
            u => u.Id == userId
        ).Select(
            u => new
            {
                u.CommunityId,
                u.ResidenceId
            }
        )
        .FirstOrDefaultAsync();

        if (currentUser is null)
        {
            return Unauthorized();
        }

        var questions = await _dbContext.Questions.AsNoTracking().Where(
            q => _dbContext.VisibilityRules.Any(v =>
                v.SourceCommunityId == currentUser.CommunityId &&
                v.SourceResidenceId == currentUser.ResidenceId &&
                v.AllowedCommunityId == q.CommunityId &&
                v.AllowedResidenceId == q.ResidenceId
            ))
            .Where(q => !categoryId.HasValue || q.CategoryId == categoryId.Value)
            .OrderByDescending(q => q.CreatedAt)
            .Select(q => new
            {
                q.Id,
                q.QuestionText,
                q.CategoryId,
                q.CreatedAt
            })
            .ToListAsync();
        
        return Ok(questions);
    }
}