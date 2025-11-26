namespace AtlasConfigurator.Models.Auth
{
    public enum AuthenticationStatus
    {
        Authenticated,
        NotAuthenticated,
        Error // Use this for system errors or when the refresh process fails
    }
}
