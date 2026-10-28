
using DTOs;
using Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Security.Claims;

namespace Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;

    public AuthController(
        AppDbContext dbContext,
        IPasswordHasher<User> passwordHasher)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
    }

    private async Task<CurrentUserResponse> SignInUserAsync(
        User user)
    {
        var claims = new List<Claim>
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()
            )
        };

        var identity = new ClaimsIdentity(
            claims,
            CookieAuthenticationDefaults.AuthenticationScheme
        );

        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal,
            new AuthenticationProperties
            {
                IsPersistent = true
            }
        );

        return new CurrentUserResponse
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            CommunityId = user.CommunityId,
            ResidenceId = user.ResidenceId
        };
    }

    [EnableRateLimiting("register")]
    [HttpPost("register")]
    public async Task<IActionResult> Register(
        RegisterRequest request)
    {
        var ipAddress =
            HttpContext.Connection.RemoteIpAddress?.ToString();

        if (ipAddress is null)
            return StatusCode(500);

        var ipIsBlocked = await _dbContext.BlockedIps
            .AnyAsync(b =>
                b.IpAddress == ipAddress &&
                b.BlockedUntil > DateTime.UtcNow);

        if (ipIsBlocked)
            return StatusCode(403);

        if (!string.IsNullOrWhiteSpace(request.Address))
        {
            var blockedIp = await _dbContext.BlockedIps
                .FirstOrDefaultAsync(b =>
                    b.IpAddress == ipAddress);

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
                blockedIp.BlockedUntil =
                    DateTime.UtcNow.AddDays(30);
                blockedIp.Reason = "Honeypot";
            }

            await _dbContext.SaveChangesAsync();
            return StatusCode(403);
        }

        var emailExists = await _dbContext.Users
            .AnyAsync(u => u.Email == request.Email);

        if (emailExists)
            return Conflict("Email already registered.");

        var communityExists = await _dbContext.Communities
            .AnyAsync(c => c.Id == request.CommunityId);

        if (!communityExists)
            return BadRequest("Invalid CommunityId.");

        var residenceExists = await _dbContext.Residences
            .AnyAsync(r => r.Id == request.ResidenceId);

        if (!residenceExists)
            return BadRequest("Invalid ResidenceId.");

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

        return Ok(await SignInUserAsync(user));
    }

    [EnableRateLimiting("login")]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var ipAddress =
            HttpContext.Connection.RemoteIpAddress?.ToString();

        if (ipAddress is null)
            return StatusCode(500);

        var ipIsBlocked = await _dbContext.BlockedIps
            .AnyAsync(b =>
                b.IpAddress == ipAddress &&
                b.BlockedUntil > DateTime.UtcNow);

        if (ipIsBlocked)
            return StatusCode(403);

        if (!string.IsNullOrWhiteSpace(request.Address))
        {
            var blockedIp = await _dbContext.BlockedIps
                .FirstOrDefaultAsync(b =>
                    b.IpAddress == ipAddress);

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
                blockedIp.BlockedUntil =
                    DateTime.UtcNow.AddDays(30);
                blockedIp.Reason = "Honeypot";
            }

            await _dbContext.SaveChangesAsync();
            return StatusCode(403);
        }

        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u =>
                u.Email == request.Email);

        if (user is null)
            return Unauthorized("Invalid email or password.");

        var passwordResult =
            _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password
            );

        if (passwordResult ==
            PasswordVerificationResult.Failed)
        {
            return Unauthorized(
                "Invalid email or password."
            );
        }

        return Ok(await SignInUserAsync(user));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
            return Unauthorized();

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
    [HttpPatch("username")]
    public async Task<IActionResult> UpdateUsername(
        UpdateUsernameRequest request
    )
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if(!Guid.TryParse(userIdClaim, out var userId))
        return Unauthorized();

        var username = request.Username.Trim();

        if (username.Length < 1 || username.Length > 12)
            return BadRequest("Username must be 1 to 12 characters.");

        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
            return Unauthorized();

        user.Username = username;

        await _dbContext.SaveChangesAsync();

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
