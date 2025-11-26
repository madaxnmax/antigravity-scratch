using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace AtlasConfigurator.Services
{
    public class AzureStorage
    {
        public async Task<string> UploadEmailToAzure(byte[] file)
        {
            if (file != null)
            {
                string blobName = Guid.NewGuid().ToString();
                blobName = blobName + ".eml";
                string containerName = string.Empty;
                containerName = "configurator";

                if (!string.IsNullOrEmpty(containerName))
                {
                    byte[] fileBytes;

                    AzureVaultAuthentication av = new AzureVaultAuthentication();
                    string connectionString = av.RetrieveSecret("AzureStorageConnection");
                    string accountName = av.RetrieveSecret("AzureStorageAccountName");





                    try
                    {
                        BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);
                        BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);
                        BlobClient blobClient = containerClient.GetBlobClient(blobName);
                        var uploadOptions = new BlobUploadOptions
                        {
                            HttpHeaders = new BlobHttpHeaders
                            {
                                ContentType = "message/rfc822" // Set the desired content type here
                            }
                        };
                        using var mem = new MemoryStream(file);
                        await blobClient.UploadAsync(mem, uploadOptions);

                        return blobClient.Uri.AbsoluteUri;
                    }
                    catch (Exception ex)
                    {
                        ex.ToString();
                        return null;
                    }
                }

            }
            return null;
        }
    }
}
