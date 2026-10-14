using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Models;

[Index(nameof(IpAddress), IsUnique = true)]
public class BlockedIp
{
    [Key]
    public Guid Id {get; set;}

    public required string IpAddress {get; set;}

    public DateTime BlockedUntil {get; set;}

    public string Reason {get; set;} = "Honeypot";
}