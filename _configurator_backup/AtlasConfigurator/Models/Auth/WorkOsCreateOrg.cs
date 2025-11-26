using Newtonsoft.Json;

namespace AtlasConfigurator.Models.Auth
{

    // Root myDeserializedClass = JsonConvert.DeserializeObject<Root>(myJsonResponse);


    public class WorkOsCreateOrg
    {
        public string id { get; set; }
        public string @object { get; set; }
        public string name { get; set; }
        public bool allow_profiles_outside_organization { get; set; }
        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
        [JsonProperty("domains")]
        public List<WorkOsCreateOrgDomain> domains { get; set; }
    }
    public class WorkOsCreateOrgDomain
    {
        public string domain { get; set; }
        public string id { get; set; }
        public string @object { get; set; }
    }

}
