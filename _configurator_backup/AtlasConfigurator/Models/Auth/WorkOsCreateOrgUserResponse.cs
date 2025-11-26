namespace AtlasConfigurator.Models.Auth
{

    // Root myDeserializedClass = JsonConvert.DeserializeObject<Root>(myJsonResponse);
    public class Role
    {
        public string slug { get; set; }
    }

    public class WorkOsCreateOrgUserResponse
    {
        public string @object { get; set; }
        public string id { get; set; }
        public string user_id { get; set; }
        public string organization_id { get; set; }
        public Role role { get; set; }
        public string status { get; set; }
        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
    }


}
