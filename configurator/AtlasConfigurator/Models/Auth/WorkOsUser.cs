namespace AtlasConfigurator.Models.Auth
{
    public class WorkOsUser
    {
        public User user { get; set; }
        public string access_token { get; set; }
        public string refresh_token { get; set; }
        // Add other fields as per the WorkOS response
        public string organization_id { get; set; } // Added organization_id property

    }
    public class User
    {
        public string @object { get; set; }
        public string id { get; set; }
        public string email { get; set; }
        public bool email_verified { get; set; }
        public object first_name { get; set; }
        public object last_name { get; set; }
        public object profile_picture_url { get; set; }
        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
    }

}
