
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Models;

namespace Data;

public class AppDbContext : DbContext, IDataProtectionKeyContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Question> Questions => Set<Question>();

    public DbSet<Response> Responses => Set<Response>();

    public DbSet<Community> Communities => Set<Community>();

    public DbSet<Residence> Residences => Set<Residence>();

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<VisibilityRule> VisibilityRules => Set<VisibilityRule>();

    public DbSet<BlockedIp> BlockedIps => Set<BlockedIp>();

    public DbSet<DataProtectionKey> DataProtectionKeys =>
        Set<DataProtectionKey>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .Property(u => u.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<Question>()
            .Property(q => q.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<Response>()
            .Property(r => r.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<Community>()
            .Property(c => c.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<Residence>()
            .Property(r => r.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<Category>()
            .Property(c => c.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<VisibilityRule>()
            .Property(v => v.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<BlockedIp>()
            .Property(b => b.Id)
            .HasDefaultValueSql("gen_random_uuid()");

        modelBuilder.Entity<User>()
            .HasOne(u => u.Community)
            .WithMany()
            .HasForeignKey(u => u.CommunityId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Residence)
            .WithMany()
            .HasForeignKey(u => u.ResidenceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<VisibilityRule>()
            .HasOne(v => v.SourceCommunity)
            .WithMany()
            .HasForeignKey(v => v.SourceCommunityId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<VisibilityRule>()
            .HasOne(v => v.SourceResidence)
            .WithMany()
            .HasForeignKey(v => v.SourceResidenceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<VisibilityRule>()
            .HasOne(v => v.AllowedCommunity)
            .WithMany()
            .HasForeignKey(v => v.AllowedCommunityId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<VisibilityRule>()
            .HasOne(v => v.AllowedResidence)
            .WithMany()
            .HasForeignKey(v => v.AllowedResidenceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<VisibilityRule>()
            .HasIndex(v => new
            {
                v.SourceCommunityId,
                v.SourceResidenceId
            });

        modelBuilder.Entity<VisibilityRule>()
            .HasIndex(v => new
            {
                v.SourceCommunityId,
                v.SourceResidenceId,
                v.AllowedCommunityId,
                v.AllowedResidenceId
            })
            .IsUnique();

        modelBuilder.Entity<Question>()
            .HasOne(q => q.User)
            .WithMany()
            .HasForeignKey(q => q.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Question>()
            .HasOne(q => q.Community)
            .WithMany()
            .HasForeignKey(q => q.CommunityId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Question>()
            .HasOne(q => q.Residence)
            .WithMany()
            .HasForeignKey(q => q.ResidenceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Question>()
            .HasOne(q => q.Category)
            .WithMany()
            .HasForeignKey(q => q.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Question>()
            .HasIndex(q => new
            {
                q.CommunityId,
                q.ResidenceId,
                q.CategoryId,
                q.CreatedAt
            })
            .IsDescending(false, false, false, true);

        modelBuilder.Entity<Question>()
            .HasIndex(q => q.UserId);

        modelBuilder.Entity<Response>()
            .HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Response>()
            .HasOne(r => r.Question)
            .WithMany()
            .HasForeignKey(r => r.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Response>()
            .HasIndex(r => r.QuestionId);

        modelBuilder.Entity<Response>()
            .HasIndex(r => r.UserId);
    }
}
