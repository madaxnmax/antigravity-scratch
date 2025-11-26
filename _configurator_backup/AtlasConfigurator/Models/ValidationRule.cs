namespace AtlasConfigurator.Models
{
    public class ValidationRule
    {
        public Func<bool> Condition { get; set; }
        public string Message { get; set; }
    }
}
