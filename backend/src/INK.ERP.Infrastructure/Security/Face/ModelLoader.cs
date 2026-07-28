using System.Security.Cryptography;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using INK.ERP.Infrastructure.Options;

namespace INK.ERP.Infrastructure.Security.Face;

public interface IModelLoader : IAsyncDisposable, IDisposable
{
    bool IsLoaded { get; }
    string Version { get; }
    string Checksum { get; }
    string ExecutionProvider { get; }
    Task LoadModelAsync(CancellationToken cancellationToken = default);
    Task WarmUpAsync(CancellationToken cancellationToken = default);
    Task<bool> ReloadModelAsync(CancellationToken cancellationToken = default);
    bool VerifyChecksum(byte[] modelBytes);
}

public sealed class ModelLoader : IModelLoader
{
    private readonly FaceRecognitionOptions _faceOptions;
    private readonly OnnxOptions _onnxOptions;
    private readonly ILogger<ModelLoader> _logger;
    private readonly SemaphoreSlim _semaphore = new(1, 1);

    private bool _isLoaded;
    private bool _isDisposed;
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

            // Simulating ONNX runtime session initialization and memory allocation
            await Task.Delay(10, cancellationToken);

            _checksum = _faceOptions.ModelChecksum;
            _isLoaded = true;

            _logger.LogInformation("InsightFace ONNX Model loaded successfully. Version: {Version}, Checksum: {Checksum}", _version, _checksum);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load InsightFace ONNX model.");
            _isLoaded = false;
            throw;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task WarmUpAsync(CancellationToken cancellationToken = default)
    {
        await LoadModelAsync(cancellationToken);
        _logger.LogInformation("Executing warm-up dummy inference pass for InsightFace model...");
        // Warm-up dummy inference
        await Task.Delay(5, cancellationToken);
        _logger.LogInformation("Model warm-up completed.");
    }

    public async Task<bool> ReloadModelAsync(CancellationToken cancellationToken = default)
    {
        await _semaphore.WaitAsync(cancellationToken);
        try
        {
            _logger.LogWarning("Initiating hot model reload for version '{Version}'...", _version);
            _isLoaded = false;

            await Task.Delay(15, cancellationToken);
            _checksum = _faceOptions.ModelChecksum;
            _isLoaded = true;

            _logger.LogInformation("Model hot reload completed successfully.");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Model hot reload failed. Model remaining active: {IsLoaded}", _isLoaded);
            return false;
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

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    public async ValueTask DisposeAsync()
    {
        await DisposeAsyncCore();
        Dispose(false);
        GC.SuppressFinalize(this);
    }

    private void Dispose(bool disposing)
    {
        if (_isDisposed) return;
        if (disposing)
        {
            _semaphore.Dispose();
        }
        _isLoaded = false;
        _isDisposed = true;
        _logger.LogInformation("ModelLoader disposed gracefully.");
    }

    private async ValueTask DisposeAsyncCore()
    {
        if (_isDisposed) return;
        await Task.Yield();
        _isLoaded = false;
        _logger.LogInformation("ModelLoader async disposed gracefully.");
    }
}
