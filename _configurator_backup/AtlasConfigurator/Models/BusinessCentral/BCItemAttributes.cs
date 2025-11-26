using Newtonsoft.Json;

namespace AtlasConfigurator.Models.BusinessCentral
{
    public class BCItemAttributes
    {
        [JsonProperty("@odata.context")]
        public string odatacontext { get; set; }
        [JsonProperty("value")]
        public List<BCItemAttributesProperty> BCItemAttributesProperty { get; set; }
    }
    public class BCItemAttributesProperty
    {
        [JsonProperty("@odata.etag")]
        public string? odataetag { get; set; }
        public int? tableID { get; set; }
        public string? ItemNumber { get; set; }
        public int? itemAttributeID { get; set; }
        public int? itemAttributeValueID { get; set; }
        public string? itemAttributeName { get; set; }
        public string? itemAttributeValueName { get; set; }
        public decimal? netWeight { get; set; }
        public decimal? grossWeight { get; set; }
    }
}
