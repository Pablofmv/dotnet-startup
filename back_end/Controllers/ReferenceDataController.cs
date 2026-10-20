using Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Controllers;

[ApiController]
[Route("reference-data")]
public class ReferenceDataController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public ReferenceDataController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("communities")]
    public async Task<IActionResult> GetCommunities()
    {
        var communities = await _dbContext.Communities
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new{
                c.Id,
                c.Name
            })
            .ToListAsync();
        
        return Ok(communities);
    }

    [HttpGet("residences")]
    public async Task<IActionResult> GetResidences()
    {
        var residences = await _dbContext.Residences 
            .AsNoTracking()
            .OrderBy(r => r.State)
            .Select(r => new {
                r.Id,
                r.State
            })
            .ToListAsync();
        
        return Ok(residences);
    }

}