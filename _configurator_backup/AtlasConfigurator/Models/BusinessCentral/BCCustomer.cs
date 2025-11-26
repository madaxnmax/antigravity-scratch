using Newtonsoft.Json;

namespace AtlasConfigurator.Models.BusinessCentral
{
    public class BCCustomer
    {
        [JsonProperty("@odata.context")]
        public string odatacontext { get; set; }
        public List<Customer> value { get; set; }
    }
    public class Customer
    {
        [JsonProperty("@odata.etag")]
        public string odataetag { get; set; }
        public string No { get; set; }
        public string Name { get; set; }
        public string Customer_Price_Group { get; set; }
    }
}
