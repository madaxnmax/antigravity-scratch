using AtlasConfigurator.Hubs;
using AtlasConfigurator.Services;
using Azure.Storage.Blobs;
using Azure.Storage.Queues;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace AtlasConfigurator.Controllers
{
    [ApiController]
    [Route("api/Front")]
    public class FrontController : Controller
    {
        private readonly IHubContext<JobStatusHub> _hubContext;
        private readonly JobTaskManager _jobTaskManager;
        private readonly SmartCalculationService _calcService;
        private readonly ILogger _logger;

        public FrontController(IHubContext<JobStatusHub> hubContext, JobTaskManager jobTaskManager, SmartCalculationService calcService, ILoggerFactory loggerFactory)
        {
            _hubContext = hubContext;
            _jobTaskManager = jobTaskManager;
            _calcService = calcService;
            _logger = loggerFactory.CreateLogger<FrontController>();
        }

        [HttpPost]
        public async Task<IActionResult> ReceiveWebhook([FromBody] JsonElement payload)
        {
            var logger = _logger;
            logger.LogInformation("Received webhook request.");

            var requestHeaders = Request.Headers;

            // Extract timestamp and signature
            string timestamp = requestHeaders.ContainsKey("x-front-request-timestamp")
                ? requestHeaders["x-front-request-timestamp"].FirstOrDefault() ?? string.Empty
                : string.Empty;

            string providedSignature = requestHeaders.ContainsKey("x-front-signature")
                ? requestHeaders["x-front-signature"].FirstOrDefault() ?? string.Empty
                : string.Empty;

            string token = "f34d8cea1172f0dd55da83a10d0f5591"; // Replace with your actual webhook token

            // Validate headers
            if (string.IsNullOrEmpty(timestamp) || string.IsNullOrEmpty(providedSignature))
            {
                logger.LogError("Missing timestamp or signature.");
                return Ok(); // Or another appropriate status code
            }

            // Read request body as string
            string requestBody = payload.ToString();
            logger.LogInformation($"Webhook payload: {requestBody}");

            // Signature validation
            try
            {
                string baseString = $"{timestamp}:";
                byte[] baseStringBytes = Encoding.UTF8.GetBytes(baseString);
                byte[] requestBodyBytes = Encoding.UTF8.GetBytes(requestBody);
                byte[] concatenatedBytes = baseStringBytes.Concat(requestBodyBytes).ToArray();

                using (HMACSHA256 hmac = new HMACSHA256(Encoding.UTF8.GetBytes(token)))
                {
                    byte[] computedSignatureBytes = hmac.ComputeHash(concatenatedBytes);
                    string computedSignature = Convert.ToBase64String(computedSignatureBytes);

                    if (computedSignature != providedSignature)
                    {
                        logger.LogError("Invalid signature.");
                        return Unauthorized(); // Respond with an Unauthorized status
                    }
                }

                // Proceed with validation challenge
                string validationChallenge = requestHeaders.ContainsKey("x-front-challenge")
                    ? requestHeaders["x-front-challenge"].FirstOrDefault() ?? string.Empty
                    : string.Empty;

                if (!string.IsNullOrEmpty(validationChallenge))
                {
                    logger.LogInformation("Challenge received, responding.");
                    return await RespondToValidationRequest(validationChallenge);
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"Error during signature validation: {ex.Message}");
                return StatusCode(500, "Internal Server Error"); // Or another appropriate status code
            }

            // Queue the request for processing
            try
            {
                AzureVaultAuthentication azureVault = new AzureVaultAuthentication();
                var connectionString = azureVault.RetrieveSecret("atlasfibrefunctionstorage");

                // Initialize Blob Storage
                BlobServiceClient blobServiceClient = new BlobServiceClient(connectionString);
                BlobContainerClient containerClient = blobServiceClient.GetBlobContainerClient("front-webhook-payloads");

                // Ensure the container exists
                await containerClient.CreateIfNotExistsAsync();

                // Generate a unique blob name
                string blobName = $"webhook-payload-{Guid.NewGuid()}.json";
                BlobClient blobClient = containerClient.GetBlobClient(blobName);

                // Save the payload to Blob Storage
                using (MemoryStream ms = new MemoryStream(Encoding.UTF8.GetBytes(requestBody)))
                {
                    await blobClient.UploadAsync(ms, true);
                }
                string blobUri = blobClient.Uri.ToString();
                logger.LogInformation($"Payload saved to Blob Storage: {blobUri}");

                // Initialize Queue Storage
                QueueClient queueClient = new QueueClient(connectionString, "front-webhook-queue");
                await queueClient.CreateIfNotExistsAsync();

                // Send the Blob URI to the queue
                if (await queueClient.ExistsAsync())
                {
                    await queueClient.SendMessageAsync(blobUri);
                    logger.LogInformation("Blob URI added to queue successfully.");
                }
            }
            catch (Exception ex)
            {
                logger.LogError($"Error adding payload to queue: {ex.Message}");
                return StatusCode(500, "Internal Server Error");
            }

            // Respond to webhook
            return Ok("Webhook received and queued for processing.");
        }

        private static async Task<IActionResult> RespondToValidationRequest(string validationChallenge)
        {
            return new ContentResult
            {
                Content = validationChallenge,
                ContentType = "text/plain",
                StatusCode = 200
            };
        }
    }
}
