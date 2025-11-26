namespace AtlasConfigurator.Models.Auth
{
    public class WorkOSOrgs
    {
        public List<Datum> data { get; set; }
        public ListMetadata list_metadata { get; set; }
    }

    public class Datum
    {
        public string id { get; set; }
        public string @object { get; set; }
        public string name { get; set; }
        public bool allow_profiles_outside_organization { get; set; }
        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
        public List<Domain> domains { get; set; }
    }

    public class Domain
    {
        public string domain { get; set; }
        public string id { get; set; }
        public string @object { get; set; }
    }

    public class ListMetadata
    {
        public string before { get; set; }
        public string after { get; set; }
    }

}
