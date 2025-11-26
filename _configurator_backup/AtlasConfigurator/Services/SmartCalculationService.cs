using AtlasConfigurator.Hubs;
using AtlasConfigurator.Models.SmartCut;
using Newtonsoft.Json;
using System.Text;

namespace AtlasConfigurator.Services
{
    public class SmartCalculationService
    {
        private readonly AzureVaultAuthentication _azureVaultAuthentication;
        private string SmartApiKey = "";

        public SmartCalculationService(AzureVaultAuthentication azureVaultAuthentication)
        {
            _azureVaultAuthentication = azureVaultAuthentication;
            SmartApiKey = _azureVaultAuthentication.RetrieveSecret("SMARTCUT-DEV-PROD");
        }
        public async Task<string> SendPart(SmartCalculate cal, string connectionId)
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.smartcut.dev/v2/calculate");
            request.Headers.Add("authorization", SmartApiKey);

            var json = JsonConvert.SerializeObject(cal);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            request.Content = content;

            HttpResponseMessage response = await client.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var responseString = await response.Content.ReadAsStringAsync();
            var smartId = JsonConvert.DeserializeObject<SmartCalculateID>(responseString);
            JobTracker.JobIdToConnectionMap[smartId.id] = connectionId;
            return smartId.id; // Return the jobId from SmartCut

        }
        public async Task<(string file, string error)> PartCalculationPDFExportReady(string smartId)
        {
            const string fileFormat = "pdf";
            const int maxRetries = 1;
            int retryCount = 0;
            bool ready = false;

            using var client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));


            var requestUrl = $"https://api.smartcut.dev/export?accept=application/json&content-type=application/json&authorizeation={SmartApiKey}&id={smartId}&type={fileFormat}&units=decimal";
            var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
            request.Headers.Add("authorization", SmartApiKey);

            try
            {
                var response = await client.SendAsync(request);
                if (response.IsSuccessStatusCode)
                {
                    // File is ready
                    var fileUrl = $"https://smartcut-storage.s3.eu-west-2.amazonaws.com/{smartId}.{fileFormat}";

                    return (fileUrl, "Success PartCalculationExportReady");
                }
                else
                {
                    return (null, "No PDF");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return (null, "No PDF");
            }
        }
    }
}
