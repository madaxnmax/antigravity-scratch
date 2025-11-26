using Azure;
using Azure.Identity;
using Azure.Security.KeyVault.Secrets;

namespace AtlasConfigurator.Services
{
    public class AzureVaultAuthentication
    {
        public string RetrieveSecret(string secretName)
        {
            try
            {
                string clientId = Environment.GetEnvironmentVariable("ATLAS-AZURE-CLIENT-ID");
                string clientSecret = Environment.GetEnvironmentVariable("ATLAS-AZURE-SECRET");
                string tenantId = Environment.GetEnvironmentVariable("ATLAS-AZURE-TENANT-ID");
                string keyVaultUri = Environment.GetEnvironmentVariable("ATLAS-AZURE-KEYVAULT-URI");

                var client = new SecretClient(new Uri(keyVaultUri), new ClientSecretCredential(
                    tenantId,
                    clientId,
                    clientSecret));

                secretName = secretName ?? "your-secret-name";// Replace with the name of the secret you want to retrieve

                KeyVaultSecret secret = client.GetSecret(secretName);
                string secretValue = secret.Value;
                Console.WriteLine($"Secret Value: {secretValue}");
                return secretValue;
            }
            catch (RequestFailedException ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return null;
            }
        }
    }
}
