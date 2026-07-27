using INK.ERP.Domain.Common;
using INK.ERP.Domain.Enums.Security;
using INK.ERP.Domain.Events.Security;
using INK.ERP.Domain.ValueObjects.Security;

namespace INK.ERP.Domain.Entities.Security;

public sealed class FaceTemplate : AuditableEntity
{
    public int Version { get; private set; }
    public string VectorData { get; private me; } = string.Empty;
    public string AlgorithmVersion { get; private me; } = "v1.0";
    public float QualityScore { get; private me; }
    public bool IsActive { get; private me; } = true;
    public DateTime? ArchivedAtUtc { get; private me; }

    private FaceTemplate() { } // EF Core

    public FaceTemplate(int version, FaceEmbedding embedding)
    {
        Version = version;
        VectorData = embedding.VectorData;
        AlgorithmVersion = embedding.AlgorithmVersion;
        QualityScore = embedding.QualityScore;
        IsActive = true;
    }

    public void Archive()
    {
        IsActive = false;
        ArchivedAtUtc = DateTime.UtcNow;
    }
}

public sealed class FaceVerificationLog : BaseEntity
{
    public float MatchScore { get; private set; }
    public bool IsSuccessful { get; private set; }
    public string? DeviceId { get; private set; }
    public string? FailureReason { get; private set; }

    private FaceVerificationLog() { }

    public FaceVerificationLog(float matchScore, bool isSuccessful, string? deviceId = null, string? failureReason = null)
    {
        MatchScore = matchScore;
        IsSuccessful = isSuccessful;
        DeviceId = deviceId;
        FailureReason = failureReason;
    }
}

public sealed class FaceEnrollmentLog : BaseEntity
{
    public int TemplateVersion { get; private set; }
    public FaceEnrollmentStatus Status { get; private set; }
    public string? Notes { get; private set; }

    private FaceEnrollmentLog() { }

    public FaceEnrollmentLog(int templateVersion, FaceEnrollmentStatus status, string? notes = null)
    {
        TemplateVersion = templateVersion;
        Status = status;
        Notes = notes;
    }
}

public sealed class FaceProfile : AuditableEntity
{
    private readonly List<FaceTemplate> _templates = new();
    private readonly List<FaceVerificationLog> _verificationLogs = new();
    private readonly List<FaceEnrollmentLog> _enrollmentLogs = new();

    public Guid UserId { get; private me; }
    public FaceEnrollmentStatus Status { get; private me; } = FaceEnrollmentStatus.Pending;
    public bool IsActive { get; private me; } = true;
    public int ActiveTemplateVersion { get; private me; }

    public IReadOnlyCollection<FaceTemplate> Templates => _templates.AsReadOnly();
    public IReadOnlyCollection<FaceVerificationLog> VerificationLogs => _verificationLogs.AsReadOnly();
    public IReadOnlyCollection<FaceEnrollmentLog> EnrollmentLogs => _enrollmentLogs.AsReadOnly();

    private FaceProfile() { } // EF Core

    public FaceProfile(Guid userId)
    {
        UserId = userId;
        Status = FaceEnrollmentStatus.Pending;
        IsActive = true;
    }

    public void Enroll(FaceEmbedding embedding)
    {
        if (!IsActive)
            throw new InvalidOperationException("Cannot enroll face template on an inactive profile.");

        var activeCount = _templates.Count(t => t.IsActive && !t.IsDeleted);
        if (activeCount >= 5)
        {
            throw new InvalidOperationException("Cannot have more than 5 active face templates.");
        }

        ActiveTemplateVersion++;
        var newTemplate = new FaceTemplate(ActiveTemplateVersion, embedding);
        _templates.Add(newTemplate);

        Status = FaceEnrollmentStatus.Enrolled;
        _enrollmentLogs.Add(new FaceEnrollmentLog(ActiveTemplateVersion, FaceEnrollmentStatus.Enrolled, "Initial Enrollment"));

        AddDomainEvent(new FaceEnrolledEvent(UserId, Id, ActiveTemplateVersion));
    }

    public void ReplaceTemplate(FaceEmbedding newEmbedding)
    {
        if (!IsActive)
            throw new InvalidOperationException("Cannot replace template on an inactive face profile.");

        // Archive previous templates
        foreach (var template in _templates.Where(t => t.IsActive))
        {
            template.Archive();
        }

        ActiveTemplateVersion++;
        var newTemplate = new FaceTemplate(ActiveTemplateVersion, newEmbedding);
        _templates.Add(newTemplate);

        Status = FaceEnrollmentStatus.Enrolled;
        _enrollmentLogs.Add(new FaceEnrollmentLog(ActiveTemplateVersion, FaceEnrollmentStatus.Enrolled, "Template Replaced"));

        AddDomainEvent(new FaceTemplateUpdatedEvent(Id, ActiveTemplateVersion));
    }

    public void RecordVerification(float matchScore, bool isSuccess, string? deviceId = null, string? failureReason = null)
    {
        if (!IsActive)
        {
            AddDomainEvent(new FaceVerificationFailedEvent(UserId, "Cannot verify inactive face profile."));
            throw new InvalidOperationException("Cannot verify inactive face profile.");
        }

        var log = new FaceVerificationLog(matchScore, isSuccess, deviceId, failureReason);
        _verificationLogs.Add(log);

        if (isSuccess)
        {
            AddDomainEvent(new FaceVerifiedEvent(UserId, matchScore));
        }
        else
        {
            AddDomainEvent(new FaceVerificationFailedEvent(UserId, failureReason ?? "Match score below threshold"));
        }
    }

    public void ArchiveTemplate(int version)
    {
        var template = _templates.FirstOrDefault(t => t.Version == version);
        if (template != null && template.IsActive)
        {
            template.Archive();
        }
    }

    public void Deactivate()
    {
        IsActive = false;
        Status = FaceEnrollmentStatus.Deactivated;
    }

    public void Reactivate()
    {
        IsActive = true;
        Status = _templates.Any(t => t.IsActive) ? FaceEnrollmentStatus.Enrolled : FaceEnrollmentStatus.Pending;
    }
}
