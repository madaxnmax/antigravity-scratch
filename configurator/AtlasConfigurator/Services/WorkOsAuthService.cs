using AtlasConfigurator.Interface;
using AtlasConfigurator.Models.Auth;
using Microsoft.JSInterop;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;




namespace AtlasConfigurator.Services
{
    public class WorkOsAuthService
    {

        private string WORKOS_CLIENT_ID;
        private string WORKOS_API_KEY;

        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private WorkOsUser _currentUser;
        private string _accessToken;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IServiceProvider _serviceProvider;
        private readonly IAtlasManagementService _atlasManagementService;
        private readonly Authentication _auth;
        private readonly AzureVaultAuthentication _azureVaultAuthentication;

        // Add a method to set the current user after successful authentication

        public WorkOsAuthService(HttpClient httpClient, IConfiguration configuration,
            IHttpContextAccessor httpContextAccessor, IServiceProvider serviceProvider,
            IAtlasManagementService atlasManagementService, Authentication auth, AzureVaultAuthentication azureVaultAuthentication)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            // Initialize HttpClient base address and headers as necessary
            _httpClient.BaseAddress = new Uri("https://api.workos.com/");
            _accessToken = null;
            _httpContextAccessor = httpContextAccessor;
            _serviceProvider = serviceProvider;
            _atlasManagementService = atlasManagementService;
            _auth = auth;
            _azureVaultAuthentication = azureVaultAuthentication;
            WORKOS_CLIENT_ID = _azureVaultAuthentication.RetrieveSecret("WORKOS-CLIENT-ID-PROD");
            WORKOS_API_KEY = _azureVaultAuthentication.RetrieveSecret("WORKOS-API-KEY-PROD");
            //WORKOS_CLIENT_ID = _azureVaultAuthentication.RetrieveSecret("WORKOS-CLIENT-ID-STAGE");
            //WORKOS_API_KEY = _azureVaultAuthentication.RetrieveSecret("WORKOS-API-KEY-STAGE");
        }
        public async Task<bool> SendMagicLink(string email)
        {
            //string ip = _httpContextAccessor.HttpContext.Connection.RemoteIpAddress?.ToString();
            //string ip2 = "71.184.114.21";
            // || ip.Contains("50.238.193.210") || ip2 == ip
            //nithin@nanonets.com added to Max 9-24-2024
            var bccontact = await _auth.GetContactCompanyByEmail(email);
            var status = email.Contains("@atlasfibre.com") || email.Contains("@acculam.com") || email.Contains("@nanonets.com");
            if (bccontact != null || status)
            {
                var client = new HttpClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", WORKOS_API_KEY);

                var payload = new Dictionary<string, string>
              {
                  { "email", email }
              };
                var org = await GetOrganization(email);
                bool createOrgResult = false;
                if (org?.data?.Count > 0)
                {
                    createOrgResult = true;
                }
                else
                {
                    string companyName = bccontact?.Company_Name ?? "";

                    string domain = email.Split('@')[1];

                    if (status)
                    {
                        if (string.IsNullOrEmpty(companyName))
                        {
                            if (domain.Contains("atlasfibre.com"))
                            {
                                companyName = "Atlas Fibre";
                            }
                            else if (domain.Contains("acculam.com"))
                            {
                                companyName = "Accurate Composites LLC";
                            }
                            else if (domain.Contains("nanonets.com"))
                            {
                                companyName = "Nanonets";
                            }
                        }
                    }
                    var workOsCreateOrg = await CreateOrganization(domain, companyName);
                    if (workOsCreateOrg != null)
                    {
                        createOrgResult = true;
                    }
                }
                if (createOrgResult)
                {
                    var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                    var response = await client.PostAsync("https://api.workos.com/user_management/magic_auth/send", content);
                    var responseString = await response.Content.ReadAsStringAsync();
                    return response.IsSuccessStatusCode;
                }
            }
            return false;

        }


        public async Task<WorkOsUser> AuthenticateWithMagicAuth(string code, string email, string ipAddress, string userAgent)
        {
            var payload = new
            {
                client_id = WORKOS_CLIENT_ID,
                client_secret = WORKOS_API_KEY,
                grant_type = "urn:workos:oauth:grant-type:magic-auth:code",
                code = code, // This should be dynamically obtained
                email,
                ip_address = ipAddress,
                user_agent = userAgent
            };

            var response = await _httpClient.PostAsJsonAsync("user_management/authenticate", payload);

            if (response.IsSuccessStatusCode)
            {
                var responseString = await response.Content.ReadAsStringAsync();

                var user = await response.Content.ReadFromJsonAsync<WorkOsUser>();
                bool status = false;
                var bccontact = await _auth.GetContactCompanyByEmail(user.user.email);

                if (bccontact != null)
                {
                    var bccustomer = await _auth.GetCustomerByExactName(bccontact.Company_Name);
                    if (bccustomer != null)
                    {
                        await SetAccessToken(user.access_token, user.refresh_token, bccustomer.Name, bccustomer.No);
                        //do org stuff here
                        if (string.IsNullOrEmpty(user.organization_id))
                        {
                            var getOrg = await GetOrganization(user.user.email);
                            if (getOrg?.data?.Count > 0)
                            {
                                var setUser = SetUserToOrganization(user.user.id, getOrg.data.Select(x => x.id).FirstOrDefault());
                            }
                            else
                            {
                                await Logout();
                                return null;
                            }

                        }
                        return user;
                    }
                    else
                    {
                        await SetAccessToken(user.access_token, user.refresh_token, null, null);
                        status = await GetAtlasStatus();
                        if (status)
                        {
                            if (string.IsNullOrEmpty(user.organization_id))
                            {
                                var getOrg = await GetOrganization(user.user.email);
                                if (getOrg?.data?.Count > 0)
                                {
                                    var setUser = SetUserToOrganization(user.user.id, getOrg.data.Select(x => x.id).FirstOrDefault());
                                }
                                else
                                {
                                    await Logout();
                                    return null;
                                }
                            }

                            return user;
                        }
                        else
                        {
                            await Logout();
                            return null;
                        }
                    }

                }
                await SetAccessToken(user.access_token, user.refresh_token, null, null);
                status = await GetAtlasStatus();
                if (status)
                {
                    if (string.IsNullOrEmpty(user.organization_id))
                    {
                        var getOrg = await GetOrganization(user.user.email);
                        if (getOrg?.data?.Count > 0)
                        {
                            var setUser = SetUserToOrganization(user.user.id, getOrg.data.Select(x => x.id).FirstOrDefault());
                        }
                        else
                        {
                            await Logout();
                            return null;
                        }
                    }

                    return user;
                }
                else
                {
                    await Logout();
                    return null;
                }
            }
            var errorMessage = await response.Content.ReadAsStringAsync();

            throw new ApplicationException($"Failed to authenticate: {response.ReasonPhrase}");
        }

        public async Task<WorkOSOrgs> GetOrganization(string domainName)
        {
            string domain = domainName.Split('@')[1];
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", WORKOS_API_KEY);
            var response = await client.GetAsync($"https://api.workos.com/organizations?domains={domain}");

            if (response.IsSuccessStatusCode)
            {
                var jsonString = await response.Content.ReadAsStringAsync();
                var org = JsonSerializer.Deserialize<WorkOSOrgs>(jsonString);
                return org;
            }
            return null;
        }

        public async Task<WorkOsCreateOrg> CreateOrganization(string domain, string CompanyName)
        {
            var payload = new
            {
                name = CompanyName,
                domains = new string[] { domain }
            };
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", WORKOS_API_KEY);
            var response = await _httpClient.PostAsJsonAsync("organizations", payload);

            if (response.IsSuccessStatusCode)
            {
                var responseString = await response.Content.ReadAsStringAsync();

                var createorgresp = await response.Content.ReadFromJsonAsync<WorkOsCreateOrg>();
                return createorgresp;
            }
            return null;
        }
        public async Task<bool> SetUserToOrganization(string user, string org)
        {
            var payload = new
            {
                user_id = user,
                organization_id = org,
                role_slug = "member"
            };
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", WORKOS_API_KEY);
            var response = await _httpClient.PostAsJsonAsync("user_management/organization_memberships", payload);

            if (response.IsSuccessStatusCode)
            {
                var responseString = await response.Content.ReadAsStringAsync();

                var orgresp = await response.Content.ReadFromJsonAsync<WorkOsCreateOrgUserResponse>();
                return true;
            }

            return false;
        }

        public async Task<WorkOsUser> CreateUser(string email)
        {
            var payload = new
            {
                email = email
            };
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", WORKOS_API_KEY);
            var response = await _httpClient.PostAsJsonAsync("user_management/users", payload);

            if (response.IsSuccessStatusCode)
            {
                var responseString = await response.Content.ReadAsStringAsync();

                var createUser = await response.Content.ReadFromJsonAsync<WorkOsUser>();
                return createUser;
            }
            return null;
        }

        //public async Task<bool> UpdateWorkOsCustomer(string userId, string companyName, string companyNumber)
        //{
        //    var client = new HttpClient();
        //    var payload = new
        //    {
        //        custom_attributes = new
        //        {
        //            company_name = companyName,
        //            company_number = companyNumber
        //        }
        //    };

        //    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", WORKOS_API_KEY);
        //    var response = await client.PutAsJsonAsync($"https://api.workos.com/user_management/users/{userId}", payload);

        //    if (response.IsSuccessStatusCode)
        //    {
        //        var user = await GetUserDetails();
        //        return true;
        //    }
        //    return false;
        //}
        public async Task<bool> GetAtlasStatus()
        {
            var user = await GetUserDetails();
            // Return false immediately if user is null.
            if (user == null)
            {
                return false;
            }
            // Now we're sure user is not null, proceed to check the email domains.
            return user.email.Contains("@atlasfibre.com") || user.email.Contains("@acculam.com") || user.email.Contains("@nanonets.com");
        }
        public async Task<CustomerAuthCompany> GetUserCompanyDetails()
        {
            var jsRuntime = _serviceProvider.GetService<IJSRuntime>();
            var customerNo = await jsRuntime.InvokeAsync<string>("localStorage.getItem", "CustomerNo");
            var customerName = await jsRuntime.InvokeAsync<string>("localStorage.getItem", "CustomerName");

            var CustomerAuthCompany = new CustomerAuthCompany();
            CustomerAuthCompany.CompanyName = customerName;
            CustomerAuthCompany.CompanyNumber = customerNo;

            return CustomerAuthCompany;
        }


        //public async Task<string> UpdateAccessTokenWithRefreshToken(string refreshToken, string ipAddress, string userAgent)
        //{
        //    var payload = new
        //    {
        //        client_id = WORKOS_CLIENT_ID,
        //        client_secret = WORKOS_API_KEY,
        //        grant_type = "refresh_token",
        //        refresh_token = refreshToken, // This should be dynamically obtained
        //        ip_address = ipAddress,
        //        user_agent = userAgent
        //    };

        //    var response = await _httpClient.PostAsJsonAsync("user_management/authenticate", payload);

        //    if (response.IsSuccessStatusCode)
        //    {
        //        var responseString = await response.Content.ReadAsStringAsync();

        //        var user = await response.Content.ReadFromJsonAsync<RefreshToken>();
        //        await SetAccessToken(user.access_token, user.refresh_token, null, null);
        //        return user.access_token;
        //    }
        //    return null;
        //    //throw new ApplicationException($"Failed to reauthenticate: {response.ReasonPhrase}");
        //}
        public async Task<string> UpdateAccessTokenWithRefreshToken(string refreshToken, string ipAddress, string userAgent)
        {
            var payload = new
            {
                client_id = WORKOS_CLIENT_ID,
                client_secret = WORKOS_API_KEY,
                grant_type = "refresh_token",
                refresh_token = refreshToken,
                ip_address = ipAddress,
                user_agent = userAgent
            };

            var jsonPayload = Newtonsoft.Json.JsonConvert.SerializeObject(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("user_management/authenticate", content);

            if (response.IsSuccessStatusCode)
            {
                var user = await response.Content.ReadFromJsonAsync<RefreshToken>();
                await SetAccessToken(user.access_token, user.refresh_token, null, null);
                return user.access_token;
            }
            else
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Failed to reauthenticate: {response.StatusCode} - {responseContent}");
            }

            return null;
        }


        public async Task Logout()
        {
            _currentUser = null;
            _accessToken = null;

            var jsRuntime = _serviceProvider.GetService<IJSRuntime>();
            await jsRuntime.InvokeVoidAsync("localStorage.removeItem", "access_token");
            await jsRuntime.InvokeVoidAsync("localStorage.removeItem", "refresh_token");
        }

        // Add a method to set the current user after successful authentication
        public void SetCurrentUser(WorkOsUser user)
        {
            _currentUser = user;
        }

        // Method to store access token
        public async Task SetAccessToken(string accessToken, string refreshToken, string CustomerName, string CustomerNo)
        {
            var jsRuntime = _serviceProvider.GetService<IJSRuntime>();
            await jsRuntime.InvokeVoidAsync("localStorage.setItem", "access_token", accessToken);
            await jsRuntime.InvokeVoidAsync("localStorage.setItem", "refresh_token", accessToken);
            if (!string.IsNullOrEmpty(CustomerName) && !string.IsNullOrEmpty(CustomerNo))
            {
                await jsRuntime.InvokeVoidAsync("localStorage.setItem", "CustomerName", CustomerName);
                await jsRuntime.InvokeVoidAsync("localStorage.setItem", "CustomerNo", CustomerNo);
            }

        }


        // Method to retrieve access token
        public async Task<string> GetAccessToken()
        {
            var jsRuntime = _serviceProvider.GetService<IJSRuntime>();
            var accessToken = await jsRuntime.InvokeAsync<string>("localStorage.getItem", "access_token");
            return accessToken;
        }
        public async Task<string> GetRefreshToken()
        {
            var jsRuntime = _serviceProvider.GetService<IJSRuntime>();
            var refreshToken = await jsRuntime.InvokeAsync<string>("localStorage.getItem", "refresh_token");
            return refreshToken;
        }

        public async Task<AuthenticationStatus> IsUserAuthenticated(string ipAddress, string userAgent)
        {
            var accessToken = await GetAccessToken();
            if (!string.IsNullOrEmpty(accessToken) && IsTokenValid(accessToken))
            {
                return AuthenticationStatus.Authenticated;
            }

            // At this point, either the access token is missing, or it's not valid.
            var refreshToken = await GetRefreshToken();
            if (string.IsNullOrEmpty(refreshToken))
            {
                // Either no refresh token or it's invalid.
                return AuthenticationStatus.NotAuthenticated;
            }
            if (!IsTokenValid(refreshToken))
            {
                // Try to refresh the access token using the refresh token.
                var newAccessToken = await UpdateAccessTokenWithRefreshToken(refreshToken, ipAddress, userAgent);
                if (!string.IsNullOrEmpty(newAccessToken) && IsTokenValid(newAccessToken))
                {
                    // Refreshing the token failed or the new token is invalid.
                    return AuthenticationStatus.Authenticated; // or NotAuthenticated, depending on your system's needs
                }
                return AuthenticationStatus.NotAuthenticated;
            }

            // Successfully refreshed the token.
            return AuthenticationStatus.NotAuthenticated;
        }

        public bool IsTokenValid(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadToken(token) as JwtSecurityToken;

            if (jwtToken == null)
                return false;

            var now = DateTime.UtcNow;
            bool valid = now < jwtToken.ValidTo;
            if (valid)
            {
                return true;
            }
            DateTime leeway = jwtToken.ValidTo.AddHours(3);
            if (now < leeway)
            {
                return true;
            }
            return false;
        }

        public async Task<bool> IsUserAtlasManagement()
        {
            var jsRuntime = _serviceProvider.GetService<IJSRuntime>();
            var accessToken = await jsRuntime.InvokeAsync<string>("localStorage.getItem", "access_token");
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadToken(accessToken) as JwtSecurityToken;
            var userId = jwtToken.Claims.First(claim => claim.Type == "sub").Value;
            return await _atlasManagementService.IsAtlasManagementUser(userId);
        }

        public async Task<User> GetUserDetails()
        {
            var jsRuntime = _serviceProvider.GetService<IJSRuntime>();
            var accessToken = await jsRuntime.InvokeAsync<string>("localStorage.getItem", "access_token");
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadToken(accessToken) as JwtSecurityToken;
            var userId = jwtToken.Claims.First(claim => claim.Type == "sub").Value;

            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", WORKOS_API_KEY);
            var response = await client.GetAsync($"https://api.workos.com/user_management/users/{userId}");

            if (response.IsSuccessStatusCode)
            {
                var jsonString = await response.Content.ReadAsStringAsync();
                var user = JsonSerializer.Deserialize<User>(jsonString);
                return user;
            }
            return null;
        }

    }
}
