using Newtonsoft.Json;

namespace AtlasConfigurator.Models.BusinessCentral
{

    public class BCCustomerPrice
    {
        [JsonProperty("@odata.context")]
        public string odatacontext { get; set; }

        [JsonProperty("@odata.etag")]
        public string odataetag { get; set; }
        public string entryNo { get; set; }
        public string customerNo { get; set; }
        public string itemNo { get; set; }
        public int quantity { get; set; }
        public double unitPrice { get; set; }
        public double discountedUnitPrice { get; set; }
        public int discountedPercentage { get; set; }
    }


}
