using Newtonsoft.Json;

namespace AtlasConfigurator.Models.BusinessCentral
{
    public class CreatedResponse
    {
        [JsonProperty("@odata.context")]
        public string odatacontext { get; set; }

        [JsonProperty("@odata.etag")]
        public string odataetag { get; set; }
        public string EntryNo { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public string QuoteNo { get; set; }
        public string Json { get; set; }
    }
    public class PostCartResult
    {
        public string ResponseContent { get; set; }
        public bool IsSuccess { get; set; }
    }
}
