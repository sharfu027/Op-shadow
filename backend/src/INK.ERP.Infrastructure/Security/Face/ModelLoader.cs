using System.Security.Cryptography;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using INK.ERP.Infrastructure.Options;

namespace INK.ERP.Infrastructure.Security.Face;

public interface IModelLoader
{
    bool IsLoaded { get; }
    string Version { get; }
    string Checksum { get; }
    string ExecutionProvider { get; }
    Task LoadModelAsync(CancellationToken cancellationToken = default);
    bool VerifyChecksum(byte[] modelBytes);
}

public sealed class ModelLoader : IModelLoader
{
    private readonly FaceRecognitionOptions _faceOptions;
    private readonly OnnxOptions _onnxOptions;
    private readonly ILogger<ModelLoader> _logger;
    private readonly SemaphoreSlim _semaphore = new(1, 1);

    private bool _isLoaded;
    private string _version = "v2.1";
    private string _checksum = string.Empty;
    private string _executionProvider = "CPU";

    public bool IsLoaded => _isLoaded;
    public string Version => _version;
    public string Checksum => _checksum;
    public string ExecutionProvider => _executionProvider;

    public ModelLoader(
        IOptions<FaceRecognitionOptions> faceOptions,
        IOptions<OnnxOptions> onnxOptions,
        ILogger<ModelLoader> logger)
    {
        _faceOptions = faceOptions.Value;
        _onnxOptions = onnxOptions.Value;
        _logger = logger;
        _version = _faceOptions.ModelVersion;
        _executionProvider = _onnxOptions.ExecutionProvider;
    }

    public async Task LoadModelAsync(CancellationToken cancellationToken = default)
    {
        if (_isLoaded) return;

        await _semaphore.WaitAsync(cancellationToken);
        try
        {
            if (_isLoaded) return;

            _logger.LogInformation("Loading InsightFace ONNX Model from path '{Path}' using Provider '{Provider}'...", _faceOptions.ModelPath, _onnxOptions.ExecutionProvider);

            // Simulate model loading & checksum evaluation (ONNX Runtime engine integration hook)
            await Task.Delay(10, cancellationToken);

            _checksum = _faceOptions.ModelChecksum;
            _isLoaded = true;

            _logger.LogInformation("InsightFace ONNX Model loaded successfully. Version: {Version}, Checksum: {Checksum}", _version, _checksum);
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public bool VerifyChecksum(byte[] modelBytes)
    {
        if (modelBytes == null || modelBytes.Length == 0) return false;

        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(modelBytes);
        var calculatedChecksum = "sha256-" + BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();

        return string.Equals(calculatedChecksum, _checksum, StringComparison.OrdinalIgnoreCase);
    }
}
