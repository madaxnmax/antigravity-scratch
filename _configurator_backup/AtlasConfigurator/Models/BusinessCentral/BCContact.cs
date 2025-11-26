using Newtonsoft.Json;

namespace AtlasConfigurator.Models.BusinessCentral
{
    public class BCContact
    {
        [JsonProperty("@odata.context")]
        public string? odatacontext { get; set; }
        [JsonProperty("value")]
        public List<BCContactValue> BCContactValue { get; set; }
    }

    public class BCContactValue
    {
        [JsonProperty("@odata.etag")]
        public string? odataetag { get; set; }
        public string? No { get; set; }
        public string? Name { get; set; }
        public string? Name_2 { get; set; }
        public string? Company_Name { get; set; }
        public string? Job_Title { get; set; }
        public string? Business_Relation { get; set; }
        public string? Post_Code { get; set; }
        public string? Country_Region_Code { get; set; }
        public string? Phone_No { get; set; }
        public string? Mobile_Phone_No { get; set; }
        public string? E_Mail { get; set; }
        public string? Fax_No { get; set; }
        public string? Salesperson_Code { get; set; }
        public string? Territory_Code { get; set; }
        public string? Currency_Code { get; set; }
        public string? Language_Code { get; set; }
        public string? Search_Name { get; set; }
        public bool? Privacy_Blocked { get; set; }
        public bool? Minor { get; set; }
        public bool? Parental_Consent_Received { get; set; }
        public bool? Coupled_to_CRM { get; set; }
        public bool? Coupled_to_Dataverse { get; set; }
    }


}
