using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using INK.ERP.Infrastructure.Options;

namespace INK.ERP.Infrastructure.Security.Face;

public interface IFaceTemplateProtectionService
{
    string EncryptEmbedding(string rawVectorData);
    string DecryptEmbedding(string encryptedVectorData);
}

public sealed class FaceTemplateProtectionService : IFaceTemplateProtectionService
{
    private readonly EncryptionOptions _options;
    private readonly byte[] _key;

    public FaceTemplateProtectionService(IOptions<EncryptionOptions> options)
    {
        _options = options.Value;
        var masterKeyBytes = Convert.FromBase64String(_options.MasterKey);
        using var sha = SHA256.Create();
        _key = sha.ComputeHash(masterKeyBytes); // 256-bit key
    }

    public string EncryptEmbedding(string rawVectorData)
    {
        if (string.IsNullOrWhiteSpace(rawVectorData)) return string.Empty;

        var iv = new byte[16];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(iv);
        }

        using var aes = Aes.Create();
        aes.Key = _key;
        aes.IV = iv;

        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        var inputBytes = Encoding.UTF8.GetBytes(rawVectorData);
        var encryptedBytes = encryptor.TransformFinalBlock(inputBytes, 0, inputBytes.Length);

        var result = new byte[iv.Length + encryptedBytes.Length];
        Buffer.BlockCopy(iv, 0, result, 0, iv.Length);
        Buffer.BlockCopy(encryptedBytes, 0, result, iv.Length, encryptedBytes.Length);

        return "ENC:v" + _options.KeyVersion + ":" + Convert.ToBase64String(result);
    }

    public string DecryptEmbedding(string encryptedVectorData)
    {
        if (string.IsNullOrWhiteSpace(encryptedVectorData)) return string.Empty;
        if (!encryptedVectorData.StartsWith("ENC:")) return encryptedVectorData; // Unencrypted fallback

        var parts = encryptedVectorData.Split(':');
        var payloadBytes = Convert.FromBase64String(parts[2]);

        var iv = new byte[16];
        var cipherText = new byte[payloadBytes.Length - 16];

        Buffer.BlockCopy(payloadBytes, 0, iv, 0, 16);
        Buffer.BlockCopy(payloadBytes, 16, cipherText, 0, cipherText.Length);

        using var aes = Aes.Create();
        aes.Key = _key;
        aes.IV = iv;

        using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
        var decryptedBytes = decryptor.TransformFinalBlock(cipherText, 0, cipherText.Length);

        return Encoding.UTF8.GetString(decryptedBytes);
    }
}
