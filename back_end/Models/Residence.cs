namespace Models;

public class Residence
{
    public Guid Id {get; set;}

    public required string State {get; set;}

    public required string Country {get; set;}

    public required string Region {get; set;}
}