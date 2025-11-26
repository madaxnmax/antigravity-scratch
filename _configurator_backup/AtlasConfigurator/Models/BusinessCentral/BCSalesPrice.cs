using Newtonsoft.Json;

namespace AtlasConfigurator.Models.BusinessCentral
{
    public class BCSalesPrice
    {
        [JsonProperty("@odata.context")]
        public string odatacontext { get; set; }
        public List<SalesItem> value { get; set; }
    }
    public class SalesItem
    {
        [JsonProperty("@odata.etag")]
        public string odataetag { get; set; }
        [JsonProperty("itemno_")]
        public string ItemNoFilterCtrl { get; set; }
        [JsonProperty("salescode")]
        public string Sales_Code { get; set; }
        [JsonProperty("Minimum_Quantity")]
        public int Minimum_Quantity { get; set; }
        [JsonProperty("unitprice")]
        public double Unit_Price { get; set; }
        [JsonProperty("startingdate")]
        public string Starting_Date { get; set; }
        [JsonProperty("endingdate")]
        public string Ending_Date { get; set; }
    }
}
