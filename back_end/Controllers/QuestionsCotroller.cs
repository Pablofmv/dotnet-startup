using Data;
using DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Models;
using Services;
using System.Security.Claims;

namespace Controllers;

[ApiController]
[Route("questions")]
public class QuestionsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly ResponseService _responseService;

    public QuestionsController(AppDbContext dbContext, ResponseService responseService)
    {
        _dbContext = dbContext;
        _responseService = responseService;
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
    public async Task<IActionResult> GetQuestions(
        [FromQuery] Guid? categoryId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {

        if (page < 1 || pageSize < 1 || pageSize > 30)
        {
            return BadRequest(
                "Page must be >= 1 and pageSize mut be between 1 and 30."
            );
        }

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

        if((long)(page - 1) * pageSize > int.MaxValue)
        {
            return BadRequest("Requested page is too large.");
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
            .ThenByDescending(q => q.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize + 1)
            .Select(q => new QuestionFeedItemResponse
            {
                Id = q.Id,
                QuestionText = q.QuestionText,
                CategoryId = q.CategoryId,
                CreatedAt = q.CreatedAt,
                CanDelete = q.UserId == userId
            })
            .ToListAsync();
        
        var hasNextPage = questions.Count > pageSize;

        var response = new QuestionFeedResponse 
        {
            Questions = questions.Take(pageSize).ToList(),
            Page = page,
            PageSize = pageSize,
            HasNextPage = hasNextPage,
            HasPreviousPage = page > 1
        };
        
        return Ok(response);
    }


    [Authorize]
    [HttpGet("{questionId:guid}")]
    public async Task<IActionResult> GetQuestionById(Guid questionId)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var currentUser = await _dbContext.Users.AsNoTracking().Where(
            u => u.Id == userId
        )
        .Select(
            u => new
        {
            u.CommunityId,
            u.ResidenceId
        })
        .FirstOrDefaultAsync();

        if (currentUser is null)
        {
            return Unauthorized();
        }

        var question = await _dbContext.Questions.AsNoTracking()
            .Where(q => q.Id == questionId)
            .Where(q => _dbContext.VisibilityRules.Any(v =>
                v.SourceCommunityId == currentUser.CommunityId &&
                v.SourceResidenceId == currentUser.ResidenceId &&
                v.AllowedCommunityId == q.CommunityId &&
                v.AllowedResidenceId == q.ResidenceId
            ))
            .Select(q => new QuestionDetailResponse{
                Id = q.Id,
                QuestionText = q.QuestionText,
                CategoryId = q.CategoryId,
                CreatedAt = q.CreatedAt,
                CanDelete = q.UserId == userId
            })
            .FirstOrDefaultAsync();
        
        if(question is null)
        {
            return NotFound();
        }

        return Ok(question);
    }

    [HttpDelete("{questionId:guid}")]
    public async Task<IActionResult> DeleteQuestion(Guid questionId)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdClaim, out  var userId))
        {
            return Unauthorized();
        }

        var deletedCount = await _dbContext.Questions
            .Where(q => q.Id == questionId && q.UserId == userId)
            .ExecuteDeleteAsync();
        
        if (deletedCount == 0)
        {
            return NotFound();
        }

        return NoContent();
    }

    [Authorize]
    [EnableRateLimiting("create-response")]
    [HttpPost("{questionId:guid}/responses")]
    public async Task<IActionResult> CreateResponse(
        Guid questionId,
        CreateResponseRequest request
    )
    {
        if(string.IsNullOrWhiteSpace(request.Body))
        {
            return BadRequest("Response Body is required.");
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var currentUser = await _dbContext.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new {
                u.CommunityId,
                u.ResidenceId
            })
            .FirstOrDefaultAsync();
        
        if (currentUser is null)
        {
            return Unauthorized();
        }

        var questionIsVisible = await _dbContext.Questions
            .AnyAsync(q =>
                q.Id == questionId &&
                _dbContext.VisibilityRules.Any(v =>
                    v.SourceCommunityId == currentUser.CommunityId &&
                    v.SourceResidenceId == currentUser.ResidenceId &&
                    v.AllowedCommunityId == q.CommunityId &&
                    v.AllowedResidenceId == q.ResidenceId
                )
            );
        
        if (!questionIsVisible)
        {
            return NotFound();
        }

        var todayUtc = DateTime.UtcNow.Date;

        var responseCreatedtoday = await _dbContext.Responses.CountAsync(
            r => r.UserId == userId && r.CreatedAt >= todayUtc
        );

        if (responseCreatedtoday >= 10)
        {
            return StatusCode(
                StatusCodes.Status429TooManyRequests,
                "Maximum 10 responses per day."
            );
        }

        var response = new Response
        {
            Body = request.Body.Trim(),
            QuestionId = questionId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Responses.Add(response);

        await _dbContext.SaveChangesAsync();

        return StatusCode(
            StatusCodes.Status201Created,
            new {response.Id}
        );
    }

    [Authorize]
    [HttpGet("{questionId:guid}/responses")]
    public async Task<IActionResult> GetResponses(Guid questionId)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var currentUser = await _dbContext.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new
            {
                u.CommunityId,
                u.ResidenceId
            })
            .FirstOrDefaultAsync();
        
        if (currentUser is null)
        {
            return Unauthorized();
        }

        var questionIsVisible = await _dbContext.Questions
            .AnyAsync(q =>
                q.Id == questionId &&
                _dbContext.VisibilityRules.Any( v =>
                    v.SourceCommunityId == currentUser.CommunityId &&
                    v.SourceResidenceId == currentUser.ResidenceId &&
                    v.AllowedCommunityId == q.CommunityId &&
                    v.AllowedResidenceId == q.ResidenceId
                )
            );
        
        if (!questionIsVisible)
        {
            return NotFound();
        }

        var responses = await _dbContext.Responses 
            .AsNoTracking()
            .Where(r => r.QuestionId == questionId)
            .OrderBy(r => r.CreatedAt)
            .ThenBy(r => r.Id)
            .Select(r => new ResponseItemResponse
            {
                Id = r.Id,
                Body = r.Body,
                CreatedAt = r.CreatedAt,
                CanDelete = r.UserId == userId
            })
            .ToListAsync();
        
        return Ok(responses);
    }


    [Authorize]
    [HttpDelete("{questionId:guid}/responses/{responseId:guid}")]
    public async Task<IActionResult> DeleteResponse(
        Guid questionId,
        Guid responseId
    )
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var deleted = await _responseService.DeleteResponseAsync(
            questionId,
            responseId,
            userId
        );

        if(!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }


}