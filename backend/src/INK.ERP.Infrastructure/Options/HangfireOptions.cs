namespace INK.ERP.Infrastructure.Options;

public sealed class HangfireOptions
{
    public const string SectionName = "Hangfire";

    public string ConnectionString { get; set; } = string.Empty;
    public string SchemaName { get; set; } = "hangfire";
}
