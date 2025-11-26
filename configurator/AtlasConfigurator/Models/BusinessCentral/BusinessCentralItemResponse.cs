namespace AtlasConfigurator.Models.BusinessCentral
{
    public class BusinessCentralItemResponse
    {
        public string odatacontext { get; set; }
        public List<BusinessCentralItems> value { get; set; }
    }
    public class BusinessCentralItems
    {
        public string odataetag { get; set; }
        public string id { get; set; }
        public string no_ { get; set; }
        public string description { get; set; }
        public string baseunitofmeasure { get; set; }
        public decimal unitprice { get; set; }
        public string af_grade { get; set; }
        public string af_color { get; set; }
        public string af_cutsand { get; set; }
        public string af_nominalthickness { get; set; }
        public string af_maxthickness { get; set; }
        public string af_minthickness { get; set; }
        public string af_nominallength { get; set; }
        public string af_maxlength { get; set; }
        public string af_minlength { get; set; }
        public string af_nominalwidth { get; set; }
        public string af_maxwidth { get; set; }
        public string af_minwidth { get; set; }
        public int af_quantity { get; set; }
        public string af_kerf { get; set; }
    }
}
