using AtlasConfigurator.Hubs;
using AtlasConfigurator.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;

namespace AtlasConfigurator.Controllers
{
    [ApiController]
    [Route("api/configurator")]
    public class ConfiguratorController : Controller
    {
        private readonly IHubContext<JobStatusHub> _hubContext;
        private readonly JobTaskManager _jobTaskManager;
        private readonly SmartCalculationService _calcService;
        private string ExpectedApiKey = ""; // This should be stored securely
        private readonly AzureVaultAuthentication _keyvault;


        public ConfiguratorController(IHubContext<JobStatusHub> hubContext, JobTaskManager jobTaskManager, SmartCalculationService calcService, AzureVaultAuthentication keyvault)
        {
            _hubContext = hubContext;
            _jobTaskManager = jobTaskManager;
            _calcService = calcService;
            _keyvault = keyvault;
        }

        [HttpPost]
        public async Task<IActionResult> ReceiveConfigurator([FromBody] JsonElement payload)
        {
            ExpectedApiKey = _keyvault.RetrieveSecret("WebhookKey");
            // Check if the API key matches
            if (!Request.Headers.ContainsKey("X-API-Key") || Request.Headers["X-API-Key"] != ExpectedApiKey)
            {
                return Unauthorized(new { message = "Invalid API key" });
            }

            try
            {
                // Log the raw payload for debugging
                Console.WriteLine("Webhook received:");
                string payloadString = payload.ToString();
                Console.WriteLine(payloadString);

                // Log success
                return Ok(new { message = "Webhook processed successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing webhook: {ex.Message}");
                return Ok(new { message = "Webhook processed successfully" });

            }
        }
    }
}
