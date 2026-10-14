using System.ComponentModel.DataAnnotations;

namespace Models;

public class VisibilityRule
{
    [Key]
    public Guid Id {get; set;}

    public Guid SourceCommunityId {get; set;}

    public Community SourceCommunity {get; set;} = null!;

    public Guid SourceResidenceId {get; set;}

    public Residence SourceResidence {get; set;} = null!;

    public Guid AllowedCommunityId {get; set;}

    public Community AllowedCommunity {get; set;} = null!;

    public Guid AllowedResidenceId {get; set;}

    public Residence AllowedResidence {get; set;} = null!;
}