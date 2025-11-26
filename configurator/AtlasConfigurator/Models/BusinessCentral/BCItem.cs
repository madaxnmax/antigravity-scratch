using Newtonsoft.Json;
using System.Text.Json;

namespace AtlasConfigurator.Models.BusinessCentral
{
    public class BCItem
    {
        [JsonProperty("@odata.context")]
        public string odatacontext { get; set; }
        public List<StandardItem> value { get; set; }
    }
    public class StandardItem
    {
        [JsonProperty("@odata.etag")]
        public string odataetag { get; set; }
        public string No { get; set; }
        public string Description { get; set; }
        [JsonProperty("unitPrice")]
        public double Unit_Price { get; set; }
        [JsonProperty("inventory")]
        public decimal InventoryCtrl { get; set; }
        public decimal itemAvailInNorthAmerica { get; set; }
        //[OnDeserialized]
        //internal void OnDeserializedMethod(StreamingContext context)
        //{
        //    InventoryCtrl = itemAvailInNorthAmerica;
        //}
    }
}
