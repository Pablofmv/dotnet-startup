using DTOs;
using Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Models;

namespace Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{

    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;

    public AuthController(AppDbContext dbContext, IPasswordHasher<User> passwordHasher)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
    }

    [EnableRateLimiting("login")]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        if(ipAddress is null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError);
        }

        var ipIsBlocked = await _dbContext.BlockedIps.AnyAsync(
            b => b.IpAddress == ipAddress &&
            b.BlockedUntil > DateTime.UtcNow
        );

        if (ipIsBlocked)
        {
            return StatusCode(StatusCodes.Status403Forbidden);
        }

        if(!string.IsNullOrWhiteSpace(request.Address))
        {
            var blockedIp = await _dbContext.BlockedIps.FirstOrDefaultAsync(
                b => b.IpAddress == ipAddress
            );

            if(blockedIp is null)
            {
                blockedIp = new BlockedIp
                {
                    IpAddress = ipAddress,
                    BlockedUntil = DateTime.UtcNow.AddDays(30),
                    Reason = "Honeypot"
                };

                _dbContext.BlockedIps.Add(blockedIp);
            }
            else
            {
                blockedIp.BlockedUntil = DateTime.UtcNow.AddDays(30);
                blockedIp.Reason = "Honeypot";
            }

            await _dbContext.SaveChangesAsync();

            return StatusCode(StatusCodes.Status403Forbidden);
        }

        var user = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(
            u => u.Email == request.Email
        );

        if(user is null)
        {
            return Unauthorized("Invalid email or password.");
        }

        var passwordResult = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password
        );

        if( passwordResult == PasswordVerificationResult.Failed)
        {
            return Unauthorized("Invalid email or password.");
        }


        var claims = new List<Claim>
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()
            )
        };

        var claimsIdentity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme
        );

        var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

        var authenticationProperties = new AuthenticationProperties
        {
            IsPersistent = true
        };

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            claimsPrincipal,
            authenticationProperties
        );

        return Ok("Credential valid.");

    }


    [EnableRateLimiting("register")]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

        if (ipAddress is null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError);
        }

        var ipIsBlocked = await _dbContext.BlockedIps.AnyAsync(
            b => b.IpAddress == ipAddress && b.BlockedUntil > DateTime.UtcNow
        );

        if (ipIsBlocked)
        {
            return StatusCode(StatusCodes.Status403Forbidden);
        }

        if (!string.IsNullOrWhiteSpace(request.Address))
        {
            var blockedIp = await _dbContext.BlockedIps.FirstOrDefaultAsync(
                b => b.IpAddress == ipAddress
            );

            if (blockedIp is null)
            {
                blockedIp = new BlockedIp
                {
                    IpAddress = ipAddress,
                    BlockedUntil = DateTime.UtcNow.AddDays(30),
                    Reason = "Honeypot"
                };

                _dbContext.BlockedIps.Add(blockedIp);
            }
            else 
            {
                blockedIp.BlockedUntil = DateTime.UtcNow.AddDays(30);
                blockedIp.Reason = "Honeypot";
            }

            await _dbContext.SaveChangesAsync();

            return StatusCode(StatusCodes.Status403Forbidden);
        }


        var emailExists = await _dbContext.Users.AnyAsync(u => u.Email == request.Email);

        if (emailExists)
        {
            return Conflict("Email already registered.");
        }

        var communityExists = await _dbContext.Communities.AnyAsync(c => c.Id == request.CommunityId);

        if (!communityExists)
        {
            return BadRequest("Invalid CommunityId.");
        }

        var residenceExists = await _dbContext.Residences.AnyAsync(r => r.Id == request.ResidenceId);

        if (!residenceExists)
        {
            return BadRequest("Invalid ResidenceId.");
        }

        var user = new User
        {
            Username = "Anonymous",
            Email = request.Email,
            PasswordHash = "",
            CommunityId = request.CommunityId,
            ResidenceId = request.ResidenceId,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            request.Password
        );

        _dbContext.Users.Add(user);

        await _dbContext.SaveChangesAsync();

        return Ok();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(
            u => u.Id == userId
        );

        if (user is null)
        {
            return Unauthorized();
        }

        var currentUser = new CurrentUserResponse
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            CommunityId = user.CommunityId,
            ResidenceId = user.ResidenceId
        };

        return Ok(currentUser);

    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(
            CookieAuthenticationDefaults.AuthenticationScheme
        );

        return Ok();
    }

}