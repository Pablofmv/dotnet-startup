
using Data;
using Models;
using Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

var dataProtection = builder.Services.AddDataProtection()
    .SetApplicationName("LOCAL")
    .PersistKeysToDbContext<AppDbContext>();

if (!builder.Environment.IsDevelopment())
{
    var certificatePassword =
        builder.Configuration["LOCAL_CERT_PASSWORD"]
        ?? throw new InvalidOperationException(
            "Missing certificate password.");

    var certificate = X509CertificateLoader.LoadPkcs12FromFile(
        "/secrets/local-dataprotection.pfx",
        certificatePassword,
        X509KeyStorageFlags.EphemeralKeySet);

    dataProtection.ProtectKeysWithCertificate(certificate);
}

builder.Services.AddScoped<
    IPasswordHasher<User>,
    PasswordHasher<User>>();

builder.Services.AddScoped<ResponseService>();

builder.Services
    .AddAuthentication(
        CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.HttpOnly = true;

        options.Cookie.SecurePolicy =
            builder.Environment.IsDevelopment()
                ? CookieSecurePolicy.None
                : CookieSecurePolicy.Always;

        options.Cookie.SameSite = SameSiteMode.Strict;

        options.ExpireTimeSpan = TimeSpan.FromDays(60);
        options.SlidingExpiration = false;
    });

builder.Services.AddAuthorization();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode =
        StatusCodes.Status429TooManyRequests;

    options.AddPolicy("register", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString()
                ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 3,
                Window = TimeSpan.FromDays(1),
                QueueLimit = 0,
                AutoReplenishment = true
            }
        )
    );

    options.AddPolicy("login", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString()
                ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(15),
                QueueLimit = 0,
                AutoReplenishment = true
            }
        )
    );

    options.AddPolicy("create-question", context =>
    {
        var userId = context.User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (userId is null)
        {
            return RateLimitPartition.GetNoLimiter(
                "unauthenticated");
        }

        return RateLimitPartition.GetFixedWindowLimiter(
            userId,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 2,
                Window = TimeSpan.FromMinutes(5),
                QueueLimit = 0,
                AutoReplenishment = true
            }
        );
    });

    options.AddPolicy("create-response", context =>
    {
        var userId = context.User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (userId is null)
        {
            return RateLimitPartition.GetNoLimiter(
                "unauthenticated");
        }

        return RateLimitPartition.GetFixedWindowLimiter(
            userId,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 3,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true
            }
        );
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

app.Use(async (context, next) =>
{
    var forwardedIp =
        context.Request.Headers["X-Forwarded-For"].ToString();

    var forwardedProtocol =
        context.Request.Headers["X-Forwarded-Proto"].ToString();

    app.Logger.LogInformation(
        "Proxy test: ForwardedFor={ForwardedFor}, Protocol={Protocol}",
        forwardedIp,
        forwardedProtocol);

    await next(context);
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseRouting();
app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();
app.MapControllers();

app.Run();

