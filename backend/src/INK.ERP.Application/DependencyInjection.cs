namespace INK.ERP.Application;

using System.Reflection;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using INK.ERP.Application.Common.Behaviors;
using INK.ERP.Domain.Services.Security;
using INK.ERP.Application.Features.Security.Face.Workflows;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Register MediatR with ordered pipeline behaviors
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
            cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
            cfg.AddOpenBehavior(typeof(PerformanceBehavior<,>));
            cfg.AddOpenBehavior(typeof(TransactionBehavior<,>));
            cfg.AddOpenBehavior(typeof(AuthorizationBehavior<,>));
        });

        // Register FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        // Register Security Domain Services
        services.AddScoped<PolicyResolutionDomainService>();
        services.AddScoped<DeviceTrustDomainService>();
        services.AddScoped<SecurityRiskAssessmentService>();

        // Register Security Application Workflows
        services.AddScoped<IFaceValidationWorkflow, FaceValidationWorkflow>();
        services.AddScoped<IFaceEnrollmentWorkflow, FaceEnrollmentWorkflow>();
        services.AddScoped<IFaceVerificationWorkflow, FaceVerificationWorkflow>();

        return services;
    }
}
