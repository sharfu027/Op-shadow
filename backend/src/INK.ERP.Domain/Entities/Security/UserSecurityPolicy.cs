using INK.ERP.Domain.Common;
using INK.ERP.Domain.Enums.Security;

namespace INK.ERP.Domain.Entities.Security;

public sealed class UserSecurityPolicy : AuditableEntity
{
    public Guid UserId { get; private me; }

    public FaceVerificationMode? FaceModeOverride { get; private me; }
    public GpsVerificationMode? GpsModeOverride { get; private me; }
    public double? MaxAllowedGpsRadiusMetersOverride { get; private me; }
    public AttendanceMode? AttendanceModeOverride { get; private me; }
    public bool? RequireDeviceRegistrationOverride { get; private me; }

    public DateTime? ExpiresAtUtc { get; private me; }
    public bool IsExpired => ExpiresAtUtc.HasValue && ExpiresAtUtc.Value <= DateTime.UtcNow;

    private UserSecurityPolicy() { } // EF Core

    public UserSecurityPolicy(Guid userId)
    {
        UserId = userId;
    }

    public void OverrideFace(FaceVerificationMode mode, DateTime? expiresAtUtc = null)
    {
        FaceModeOverride = mode;
        ExpiresAtUtc = expiresAtUtc;
        LastModifiedAtUtc = DateTime.UtcNow;
    }

    public void OverrideGps(GpsVerificationMode mode, double radiusMeters, DateTime? expiresAtUtc = null)
    {
        if (radiusMeters < 0)
            throw new ArgumentOutOfRangeException(nameof(radiusMeters), "Radius cannot be negative.");

        GpsModeOverride = mode;
        MaxAllowedGpsRadiusMetersOverride = radiusMeters;
        ExpiresAtUtc = expiresAtUtc;
        LastModifiedAtUtc = DateTime.UtcNow;
    }

    public void OverrideAttendance(AttendanceMode mode, DateTime? expiresAtUtc = null)
    {
        AttendanceModeOverride = mode;
        ExpiresAtUtc = expiresAtUtc;
        LastModifiedAtUtc = DateTime.UtcNow;
    }

    public void OverrideDevice(bool requireDeviceRegistration, DateTime? expiresAtUtc = null)
    {
        RequireDeviceRegistrationOverride = requireDeviceRegistration;
        ExpiresAtUtc = expiresAtUtc;
        LastModifiedAtUtc = DateTime.UtcNow;
    }

    public void ExpireOverride()
    {
        FaceModeOverride = null;
        GpsModeOverride = null;
        MaxAllowedGpsRadiusMetersOverride = null;
        AttendanceModeOverride = null;
        RequireDeviceRegistrationOverride = null;
        ExpiresAtUtc = DateTime.UtcNow;
        LastModifiedAtUtc = DateTime.UtcNow;
    }
}
