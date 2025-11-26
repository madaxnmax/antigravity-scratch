using AtlasConfigurator.Hubs;
using AtlasConfigurator.Models.SmartCut;
using AtlasConfigurator.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text.Json;


namespace AtlasConfigurator.Controllers
{
    [ApiController]
    [Route("api/webhook")]
    public class WebhookController : Controller
    {
        private readonly IHubContext<JobStatusHub> _hubContext;
        private readonly JobTaskManager _jobTaskManager;
        private readonly SmartCalculationService _calcService;

        public WebhookController(IHubContext<JobStatusHub> hubContext, JobTaskManager jobTaskManager, SmartCalculationService calcService)
        {
            _hubContext = hubContext;
            _jobTaskManager = jobTaskManager;
            _calcService = calcService;
        }

        [HttpPost]
        public async Task<IActionResult> ReceiveWebhook([FromBody] JsonElement payload)
        {
            try
            {
                // Log the raw payload for debugging
                Console.WriteLine("Webhook received:");
                string payloadString = payload.ToString();
                Console.WriteLine(payloadString);

                // Deserialize the payload into your model
                var smartResponse = JsonConvert.DeserializeObject<SmartResponse>(payloadString);
                if (string.IsNullOrWhiteSpace(smartResponse?.jobId))
                {
                    return BadRequest(new { error = "Invalid payload: Missing jobId" });
                }

                // Process cuts and metadata if present
                if (smartResponse?.Cuts?.Count > 0)
                {
                    var dynamicObject = JsonConvert.DeserializeObject<dynamic>(payloadString);
                    var rotten = dynamicObject["metadata"]?["usedStockTally"];
                    List<ResponseUsedStockTally> uslist = new List<ResponseUsedStockTally>();

                    if (rotten is JObject rottenObject)
                    {
                        foreach (var pair in rottenObject)
                        {
                            var key = pair.Key; // Key in "usedStockTally"
                            var value = pair.Value; // Value in "usedStockTally"

                            ResponseUsedStockTally s = new ResponseUsedStockTally
                            {
                                Stock = key,
                                Qty = value.ToObject<int>() // Convert the value to integer
                            };

                            uslist.Add(s);
                            smartResponse.Metadata.UsedStockTally = s;
                        }
                    }
                }
                var pdfUrl = await _calcService.PartCalculationPDFExportReady(smartResponse.jobId);
                smartResponse.File = pdfUrl.file;
                // Complete the job task in JobTaskManager
                _jobTaskManager.CompleteTask(smartResponse.jobId, smartResponse);

                // Notify the client using SignalR
                if (JobTracker.JobIdToConnectionMap.TryGetValue(smartResponse.jobId, out var connectionId))
                {
                    await _hubContext.Clients.Client(connectionId).SendAsync("ReceiveJobStatus", smartResponse.jobId, "Completed");
                    JobTracker.JobIdToConnectionMap.TryRemove(smartResponse.jobId, out _); // Cleanup
                }
                else
                {
                    Console.WriteLine($"JobId {smartResponse.jobId} not found in memory.");
                }

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
