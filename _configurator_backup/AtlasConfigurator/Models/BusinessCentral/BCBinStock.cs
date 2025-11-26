using Newtonsoft.Json;

namespace AtlasConfigurator.Models.BusinessCentral
{
    // Root myDeserializedClass = JsonConvert.DeserializeObject<Root>(myJsonResponse);
    public class BCBinStock
    {
        [JsonProperty("@odata.context")]
        public string odatacontext { get; set; }
        public List<BCBinStockValue> value { get; set; }
    }

    public class BCBinStockValue
    {
        [JsonProperty("@odata.etag")]
        public string? odataetag { get; set; }
        public int? entryNo { get; set; }
        public string? Item_No { get; set; }
        public string? Variant_Code { get; set; }
        public string? Location_Code { get; set; }
        public string? Bin_Code { get; set; }
        public string? BinTypeCode { get; set; }
        public string? Unit_of_Measure_Code { get; set; }
        public string? Lot_No { get; set; }
        public double? Quantity { get; set; }
        public int? PickQty { get; set; }
        public int? Whse_Adjust_Qty { get; set; }
        public int? Qty_Available { get; set; }
        public string? Expiration_Date { get; set; }
    }


}
