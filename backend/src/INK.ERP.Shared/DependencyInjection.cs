namespace INK.ERP.Shared;

using Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddSharedServices(this IServiceCollection services)
    {
        // Cross-cutting Shared Utilities Registration
        return services;
    }
}
