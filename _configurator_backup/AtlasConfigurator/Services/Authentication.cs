using AtlasConfigurator.Models;
using AtlasConfigurator.Models.BusinessCentral;
using AtlasConfigurator.Models.Database;
using Microsoft.AspNetCore.Components;
using Microsoft.Identity.Client;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http.Headers;
using System.Text;

namespace AtlasConfigurator.Services
{

    public class Authentication
    {
        private readonly AzureVaultAuthentication _keyvault;
        private readonly NavigationManager _navigationManager;

        public Authentication(AzureVaultAuthentication keyvault, NavigationManager navigationManager)
        {
            _keyvault = keyvault;
            _navigationManager = navigationManager;

        }
        private string applicationID = "";
        private string clientSecret = "";
        private string tenantid = "";
        private string oAuthEndpointAuth = "";
        private static string serviceUri = "";
        private static string serviceUriGraph = "";
        private string azureAppIdUrl = "";
        static string apiVersion = "9.2";
        public string crmapiUrl = $"{serviceUri}/api/data/v{apiVersion}/";
        //private string companyid = "c2b2e84d-89f1-ec11-82f8-002248348065";
        public string _baseurl = "";
        public string getCompanyGuid = "";
        public string houugard = "";
        public string atlasfibre = "";

        public string GetBaseUrl()
        {
            return _navigationManager.BaseUri;
        }
        public Param SetComapny()
        {
            var appId = _keyvault.RetrieveSecret("DynamicsAppID");
            var appSecret = _keyvault.RetrieveSecret("DynamicsSecret");
            var appTenantId = _keyvault.RetrieveSecret("DynamicsTenantID");
            var p = new Param();
            //DynamicsAppID
            //DynamicsSecret
            //DynamicsTenantID
            if (GetBaseUrl().Contains("dev-configurator.atlasfibre.com") || GetBaseUrl().Contains("localhost"))
            //if (GetBaseUrl().Contains("dev-configurator.atlasfibre.com"))

            {

                p = new Param
                {
                    applicationID = appId,
                    clientSecret = appSecret,
                    tenantid = appTenantId,
                    oAuthEndpointAuth = "https://login.microsoftonline.com/2e880a32-1b1b-4f90-8cde-cc7f11f10656/oauth2/v2.0/authorize",
                    serviceUri = "https://api.businesscentral.dynamics.com",
                    serviceUriGraph = "https://api.businesscentral.dynamics.com/.default",
                    azureAppIdUrl = "https://login.microsoftonline.com/2e880a32-1b1b-4f90-8cde-cc7f11f10656",
                    apiVersion = "9.2",
                    _baseurl = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/Production/ODataV4/Company('Atlas%20Fibre%20MACH%202')/",
                    getCompanyGuid = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/Production/api/v2.0/companies",
                    houugard = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/Production/api/hougaard/AF/v2.0/companies(6547ba53-8c72-ed11-8c34-6045bdd6b029)/",
                    atlasfibre = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/PRODUCTION/api/AtlasFibre/AtlasFibre/v2.0/companies(6547ba53-8c72-ed11-8c34-6045bdd6b029)/"
                };
                //p = new Param
                //{
                //    applicationID = appId,
                //    clientSecret = appSecret,
                //    tenantid = appTenantId,
                //    oAuthEndpointAuth = "https://login.microsoftonline.com/2e880a32-1b1b-4f90-8cde-cc7f11f10656/oauth2/v2.0/authorize",
                //    serviceUri = "https://api.businesscentral.dynamics.com",
                //    serviceUriGraph = "https://api.businesscentral.dynamics.com/.default",
                //    azureAppIdUrl = "https://login.microsoftonline.com/2e880a32-1b1b-4f90-8cde-cc7f11f10656",
                //    apiVersion = "9.2",
                //    _baseurl = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/Test/ODataV4/Company('Atlas%20Fibre%20MACH%202')/",
                //    getCompanyGuid = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/Production/api/v2.0/companies",
                //    houugard = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/Test/api/hougaard/AF/v2.0/companies(6547ba53-8c72-ed11-8c34-6045bdd6b029)/",
                //    atlasfibre = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/Test/api/AtlasFibre/AtlasFibre/v2.0/companies(6547ba53-8c72-ed11-8c34-6045bdd6b029)/"
                //};
            }
            else
            {
                p = new Param
                {
                    applicationID = appId,
                    clientSecret = appSecret,
                    tenantid = appTenantId,
                    oAuthEndpointAuth = "https://login.microsoftonline.com/2e880a32-1b1b-4f90-8cde-cc7f11f10656/oauth2/v2.0/authorize",
                    serviceUri = "https://api.businesscentral.dynamics.com",
                    serviceUriGraph = "https://api.businesscentral.dynamics.com/.default",
                    azureAppIdUrl = "https://login.microsoftonline.com/2e880a32-1b1b-4f90-8cde-cc7f11f10656",
                    apiVersion = "9.2",
                    _baseurl = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/Production/ODataV4/Company('Atlas%20Fibre%20MACH%202')/",
                    getCompanyGuid = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/Production/api/v2.0/companies",
                    houugard = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/Production/api/hougaard/AF/v2.0/companies(6547ba53-8c72-ed11-8c34-6045bdd6b029)/",
                    atlasfibre = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/PRODUCTION/api/AtlasFibre/AtlasFibre/v2.0/companies(6547ba53-8c72-ed11-8c34-6045bdd6b029)/"
                };
            }



            return p;
        }

        public async Task<string> GetTokenAsync()
        {
            var p = SetComapny();

            applicationID = p.applicationID;
            clientSecret = p.clientSecret;
            tenantid = p.tenantid;
            oAuthEndpointAuth = p.oAuthEndpointAuth;
            serviceUri = p.serviceUri;
            serviceUriGraph = p.serviceUriGraph;
            azureAppIdUrl = p.azureAppIdUrl;
            apiVersion = "9.2";
            crmapiUrl = $"{serviceUri}/api/data/v{apiVersion}/";
            _baseurl = p._baseurl;
            getCompanyGuid = p.getCompanyGuid;
            houugard = p.houugard;
            atlasfibre = p.atlasfibre;


            IConfidentialClientApplication app;
            app = ConfidentialClientApplicationBuilder.Create(applicationID)
                                                      .WithClientSecret(clientSecret)
                                                      .WithAuthority(new Uri(oAuthEndpointAuth))
                                                      .Build();
            string[] scopes = new string[] { serviceUriGraph };

            AuthenticationResult result = null;
            try
            {
                result = await app.AcquireTokenForClient(scopes)
                                  .ExecuteAsync();
            }
            catch (MsalServiceException ex)
            {
                // AADSTS70011
                // Invalid scope. The scope has to be of the form "https://resourceurl/.default"
                // Mitigation: this is a dev issue. Change the scope to be as expected
            }
            return result.AccessToken;
        }

        public async Task<string> GetCompanyID()
        {
            var accessToken = await GetTokenAsync();
            string guid = string.Empty;
            HttpClient httpClient = new HttpClient();
            //Default Request Headers needed to be added in the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            httpClient.BaseAddress = new Uri(getCompanyGuid);
            //Examples of different filters here.

            var response = httpClient.GetAsync("").Result;

            if (response.IsSuccessStatusCode)
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

                var jRetrieveResponse = JObject.Parse(accounts);

                dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
            }
            return null;

        }
        public async Task<BCCustomer> GetCustomerByNo(string customer)
        {

            var accessToken = await GetTokenAsync();
            string guid = string.Empty;
            HttpClient httpClient = new HttpClient();
            //Default Request Headers needed to be added in the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            httpClient.BaseAddress = new Uri(_baseurl);
            //Examples of different filters here.
            var response = httpClient.GetAsync(string.Format("Customers?$filter=No eq '{0}'&$select=No,Name,Customer_Price_Group", customer)).Result;

            if (response.IsSuccessStatusCode)
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

                var jRetrieveResponse = JObject.Parse(accounts);

                dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
                var cust = JsonConvert.DeserializeObject<BCCustomer>(jRetrieveResponse.ToString());
                return cust;
            }
            return null;

        }
        public async Task<BCCustomer> GetCustomerByName(string customer)
        {

            var accessToken = await GetTokenAsync();
            string guid = string.Empty;
            HttpClient httpClient = new HttpClient();
            //Default Request Headers needed to be added in the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            httpClient.BaseAddress = new Uri(_baseurl);
            //Examples of different filters here.
            var response = httpClient.GetAsync(string.Format("Customers?$filter=startswith(Name, tolower('{0}'))&$select=No,Name,Customer_Price_Group", customer)).Result;

            if (response.IsSuccessStatusCode)
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

                var jRetrieveResponse = JObject.Parse(accounts);

                dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
                var cust = JsonConvert.DeserializeObject<BCCustomer>(jRetrieveResponse.ToString());
                return cust;
            }
            return null;

        }
        public async Task<Customer> GetCustomerByExactName(string customer)
        {

            var accessToken = await GetTokenAsync();
            string guid = string.Empty;
            HttpClient httpClient = new HttpClient();
            //Default Request Headers needed to be added in the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            httpClient.BaseAddress = new Uri(_baseurl);
            //Examples of different filters here.
            var response = httpClient.GetAsync(string.Format("Customers?$filter=Name eq '{0}'&$select=No,Name,Customer_Price_Group", customer)).Result;

            if (response.IsSuccessStatusCode)
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

                var jRetrieveResponse = JObject.Parse(accounts);

                dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
                var cust = JsonConvert.DeserializeObject<BCCustomer>(jRetrieveResponse.ToString());

                return cust.value.FirstOrDefault();
            }
            return null;
        }
        public async Task<BCContactValue> GetContactCompanyByEmail(string customer)
        {

            var accessToken = await GetTokenAsync();
            string guid = string.Empty;
            HttpClient httpClient = new HttpClient();
            //Default Request Headers needed to be added in the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            httpClient.BaseAddress = new Uri(_baseurl);
            //Examples of different filters here.
            //Contacts?$filter=E_Mail eq 'nick@eganlegacypartners.com'
            var response = httpClient.GetAsync(string.Format("Contacts?$filter=E_Mail eq '{0}'", customer)).Result;

            if (response.IsSuccessStatusCode)
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

                var jRetrieveResponse = JObject.Parse(accounts);

                dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
                var cust = JsonConvert.DeserializeObject<BCContact>(jRetrieveResponse.ToString());
                return cust.BCContactValue.FirstOrDefault();
            }
            return null;
        }
        public async Task<BCCustomerPrice> GetPriceListItemByCustomerAndItemNo(string customer, string item, int quantity)
        {

            var accessToken = await GetTokenAsync();
            HttpClient httpClient = new HttpClient();

            // Default Request Headers needed to be added to the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            // Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            // Create the JSON body
            var requestBody = new
            {
                itemNo = item,
                customerNo = customer,
                quantity = quantity
            };
            // Serialize the body to JSON
            var jsonContent = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json");
            // Send the POST request

            //var response = await httpClient.PostAsync(
            //"https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/PRODUCTION/api/AtlasFibre/AtlasFibre/v2.0/companies(6547ba53-8c72-ed11-8c34-6045bdd6b029)/SalesPrices",
            //jsonContent
            var response = await httpClient.PostAsync(
                $"{atlasfibre}/SalesPrices",
                jsonContent
                );

            if (response.IsSuccessStatusCode)
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

                var jRetrieveResponse = JObject.Parse(accounts);

                dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
                var cust = JsonConvert.DeserializeObject<BCCustomerPrice>(jRetrieveResponse.ToString());
                return cust;
            }
            return null;

        }
        public async Task<BCSalesPrice> GetCuttingCost()
        {

            var accessToken = await GetTokenAsync();
            string guid = string.Empty;
            HttpClient httpClient = new HttpClient();
            //Default Request Headers needed to be added in the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            httpClient.BaseAddress = new Uri(_baseurl);
            //Examples of different filters here.
            var response = httpClient.GetAsync(string.Format("SalesPricesx?$filter=itemno_ eq '{0}'&$select=itemno_, salescode, Minimum_Quantity, unitprice,startingdate,endingdate", "CUTCHARGE")).Result;

            if (response.IsSuccessStatusCode)
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

                var jRetrieveResponse = JObject.Parse(accounts);

                dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
                var cust = JsonConvert.DeserializeObject<BCSalesPrice>(jRetrieveResponse.ToString());
                return cust;
            }
            else
            {
                var statusCode = (int)response.StatusCode;
                var reasonPhrase = response.ReasonPhrase;
                var headers = response.Headers.ToString();
                var errorContent = await response.Content.ReadAsStringAsync();
                return null;


            }

        }
        public async Task<BCItem> GetStandardItem(Material item)
        {

            var accessToken = await GetTokenAsync();
            string guid = string.Empty;
            HttpClient httpClient = new HttpClient();
            //Default Request Headers needed to be added in the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            httpClient.BaseAddress = new Uri(atlasfibre);
            //Examples of different filters here.
            var response = httpClient.GetAsync(string.Format("Items?$filter=No eq '{0}'&$select=No,Description,unitPrice,Inventory,itemAvailInNorthAmerica", item.No)).Result;

            if (response.IsSuccessStatusCode)
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

                var jRetrieveResponse = JObject.Parse(accounts);

                dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
                var cust = JsonConvert.DeserializeObject<BCItem>(jRetrieveResponse.ToString());
                return cust;
            }
            return null;

        }
        public async Task<List<StandardItem>> GetStandardItemByNo(string item)
        {
            var accessToken = await GetTokenAsync();
            string guid = string.Empty;
            HttpClient httpClient = new HttpClient();
            //Default Request Headers needed to be added in the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            httpClient.BaseAddress = new Uri(atlasfibre);
            //Examples of different filters here.
            var response = httpClient.GetAsync(string.Format("Items?$filter=No eq '{0}'&$select=No,Description,unitPrice,Inventory,itemAvailInNorthAmerica", item)).Result;

            if (response.IsSuccessStatusCode)
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

                var jRetrieveResponse = JObject.Parse(accounts);

                dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
                var cust = JsonConvert.DeserializeObject<BCItem>(jRetrieveResponse.ToString());
                return cust.value;
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                var statusCode = response.StatusCode;
                var reasonPhrase = response.ReasonPhrase;

                // Log or inspect details here
                throw new Exception($"Request failed. Status: {(int)statusCode} {reasonPhrase}. Response: {errorContent}");
            }
            return null;
        }

        public async Task<List<StandardItem>> GetStandardItemForStockByNo(string item)
        {
            var accessToken = await GetTokenAsync();
            string guid = string.Empty;
            HttpClient httpClient = new HttpClient();
            //Default Request Headers needed to be added in the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            //httpClient.BaseAddress = new Uri("https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/PRODUCTION/api/AtlasFibre/AtlasFibre/v2.0/companies(6547ba53-8c72-ed11-8c34-6045bdd6b029)/");
            httpClient.BaseAddress = new Uri(atlasfibre);
            //Examples of different filters here.
            var response = httpClient.GetAsync(string.Format("itemLotsByBins?$filter=item_No eq '{0}'", item)).Result;

            if (response.IsSuccessStatusCode)
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

                var jRetrieveResponse = JObject.Parse(accounts);

                dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
                try
                {
                    var cust = JsonConvert.DeserializeObject<BCBinStock>(jRetrieveResponse.ToString());
                    BCItem itemObj = new BCItem
                    {
                        value = new List<StandardItem>
                    {
                       new StandardItem
                       {
                           No =  cust.value.Select(x=>x.Item_No).FirstOrDefault(),
                           Description = cust.value.Select(x=>x.Lot_No).FirstOrDefault(),
                           Unit_Price = 0,
                           InventoryCtrl = cust.value.Select(x=>x.Qty_Available).Sum(x=>x.Value),
                       }
                    }
                    };
                    return itemObj.value;
                }
                catch (Exception ex)
                {
                    return null;
                }

            }
            else
            {
                var accounts = response.Content.ReadAsStringAsync().Result;
                return null;

            }
            return null;
        }

        public async Task<BCItem> GetStandardCuttingCost()
        {

            var accessToken = await GetTokenAsync();
            string guid = string.Empty;
            HttpClient httpClient = new HttpClient();
            //Default Request Headers needed to be added in the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            httpClient.BaseAddress = new Uri(atlasfibre);
            //Examples of different filters here.
            var response = httpClient.GetAsync(string.Format("Items?$filter=No eq '{0}'&$select=No,Description,unitPrice,Inventory,itemAvailInNorthAmerica", "CUTCHARGE")).Result;

            if (response.IsSuccessStatusCode)
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

                var jRetrieveResponse = JObject.Parse(accounts);

                dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
                var cust = JsonConvert.DeserializeObject<BCItem>(jRetrieveResponse.ToString());
                return cust;
            }
            return null;

        }

        public async Task<BusinessCentralItemResponse> CheckIfItemExists(BusinessCentralItem item)
        {
            //items?$filter=af_quantity eq 27 and af_grade eq 'G11' and af_color eq 'Natural' and af_nominalthickness eq '0.125' and af_nominallength eq '15' and af_nominalwidth eq '14.5' and af_kerf eq '0.2'
            var accessToken = await GetTokenAsync();
            string guid = string.Empty;
            HttpClient httpClient = new HttpClient();
            //Default Request Headers needed to be added in the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            // string baseURL = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/Production/api/hougaard/AF/v2.0/companies(6547ba53-8c72-ed11-8c34-6045bdd6b029)/";
            //string baseURL = houugard;

            string baseURL = atlasfibre;

            httpClient.BaseAddress = new Uri(baseURL);
            //Examples of different filters here.
            //var response = httpClient.GetAsync(string.Format("items?$filter=af_quantity eq {0} and af_grade eq '{1}' and af_color eq '{2}' and af_nominalthickness eq '{3}' and af_nominallength eq '{4}' and af_nominalwidth eq '{5}' and af_kerf eq '{6}'",item.Quantity,item.Grade,item.Color,item.NominalThickness,item.NominalLength,item.NominalWidth,item.Kerf)).Result;
            var response = httpClient.GetAsync(string.Format("items?$filter=af_quantity eq {0} and af_grade eq '{1}' and af_color eq '{2}' and af_nominalthickness eq '{3}' and af_nominallength eq '{4}' and af_nominalwidth eq '{5}' and af_kerf eq '{6}' and af_minlength eq '{7}' and af_maxlength eq '{8}' and af_minwidth eq '{9}' and af_maxwidth eq '{10}'", item.Quantity, item.Grade, item.Color, item.NominalThickness, item.NominalLength, item.NominalWidth, item.Kerf, item.MinLength, item.MaxLength, item.MinWidth, item.MaxWidth)).Result;
            if (response.IsSuccessStatusCode)
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

                var jRetrieveResponse = JObject.Parse(accounts);

                dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
                var cust = JsonConvert.DeserializeObject<BusinessCentralItemResponse>(jRetrieveResponse.ToString());
                return cust;
            }
            return null;

        }

        //public async Task<List<BCItemAttributesProperty>> GetListOfItemAttributes()
        //{
        //    //items?$filter=af_quantity eq 27 and af_grade eq 'G11' and af_color eq 'Natural' and af_nominalthickness eq '0.125' and af_nominallength eq '15' and af_nominalwidth eq '14.5' and af_kerf eq '0.2'
        //    var accessToken = await GetTokenAsync();
        //    string guid = string.Empty;
        //    HttpClient httpClient = new HttpClient();
        //    //Default Request Headers needed to be added in the HttpClient Object
        //    httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
        //    httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
        //    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        //    //Set the Authorization header with the Access Token received specifying the Credentials
        //    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        //    //sandbox
        //    string baseURL = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/TEST/api/AtlasFibre/AtlasFibre/v2.0/companies(6547ba53-8c72-ed11-8c34-6045bdd6b029)/itemAttributes";
        //    httpClient.BaseAddress = new Uri(baseURL);
        //    //Examples of different filters here.
        //    //var response = httpClient.GetAsync(string.Format("items?$filter=af_quantity eq {0} and af_grade eq '{1}' and af_color eq '{2}' and af_nominalthickness eq '{3}' and af_nominallength eq '{4}' and af_nominalwidth eq '{5}' and af_kerf eq '{6}'",item.Quantity,item.Grade,item.Color,item.NominalThickness,item.NominalLength,item.NominalWidth,item.Kerf)).Result;
        //    var response = httpClient.GetAsync("").Result;
        //    if (response.IsSuccessStatusCode)
        //    {
        //        var accounts = response.Content.ReadAsStringAsync().Result;

        //        var jRetrieveResponse = JObject.Parse(accounts);

        //        dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
        //        var cust = JsonConvert.DeserializeObject<BCItemAttributes>(jRetrieveResponse.ToString());
        //        return cust.BCItemAttributesProperty;
        //    }
        //    return null;
        //}

        public async Task<List<BCItemAttributesProperty>> GetListOfItemAttributesSheet()
        {
            //items?$filter=af_quantity eq 27 and af_grade eq 'G11' and af_color eq 'Natural' and af_nominalthickness eq '0.125' and af_nominallength eq '15' and af_nominalwidth eq '14.5' and af_kerf eq '0.2'

            var accessToken = await GetTokenAsync();
            string guid = string.Empty;
            HttpClient httpClient = new HttpClient();
            //Default Request Headers needed to be added in the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            // PROD URL
            //string baseURL = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/PRODUCTION/api/AtlasFibre/AtlasFibre/v2.0/companies(6547ba53-8c72-ed11-8c34-6045bdd6b029)/itemAttributes?$filter=ItemCategoryCode eq 'LAM SHEET'";
            string baseURL = $"{atlasfibre}/itemAttributes?$filter=ItemCategoryCode eq 'LAM SHEET'";

            httpClient.BaseAddress = new Uri(baseURL);
            //Examples of different filters here.
            //var response = httpClient.GetAsync(string.Format("items?$filter=af_quantity eq {0} and af_grade eq '{1}' and af_color eq '{2}' and af_nominalthickness eq '{3}' and af_nominallength eq '{4}' and af_nominalwidth eq '{5}' and af_kerf eq '{6}'",item.Quantity,item.Grade,item.Color,item.NominalThickness,item.NominalLength,item.NominalWidth,item.Kerf)).Result;
            var response = httpClient.GetAsync("").Result;
            if (response.IsSuccessStatusCode)
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

                var jRetrieveResponse = JObject.Parse(accounts);

                dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
                var cust = JsonConvert.DeserializeObject<BCItemAttributes>(jRetrieveResponse.ToString());
                return cust.BCItemAttributesProperty;
            }
            else
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

            }
            return null;

        }
        public async Task<List<BCItemAttributesProperty>> GetListOfItemAttributesRod()
        {
            //items?$filter=af_quantity eq 27 and af_grade eq 'G11' and af_color eq 'Natural' and af_nominalthickness eq '0.125' and af_nominallength eq '15' and af_nominalwidth eq '14.5' and af_kerf eq '0.2'
            var accessToken = await GetTokenAsync();
            string guid = string.Empty;
            HttpClient httpClient = new HttpClient();
            //Default Request Headers needed to be added in the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            //prod url
            //string baseURL = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/PRODUCTION/api/AtlasFibre/AtlasFibre/v2.0/companies(6547ba53-8c72-ed11-8c34-6045bdd6b029)/itemAttributes?$filter=ItemCategoryCode eq 'LAM ROD'";
            string baseURL = $"{atlasfibre}/itemAttributes?$filter=ItemCategoryCode eq 'LAM ROD'";

            httpClient.BaseAddress = new Uri(baseURL);
            //Examples of different filters here.
            //var response = httpClient.GetAsync(string.Format("items?$filter=af_quantity eq {0} and af_grade eq '{1}' and af_color eq '{2}' and af_nominalthickness eq '{3}' and af_nominallength eq '{4}' and af_nominalwidth eq '{5}' and af_kerf eq '{6}'",item.Quantity,item.Grade,item.Color,item.NominalThickness,item.NominalLength,item.NominalWidth,item.Kerf)).Result;
            var response = httpClient.GetAsync("").Result;
            if (response.IsSuccessStatusCode)
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

                var jRetrieveResponse = JObject.Parse(accounts);

                dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
                var cust = JsonConvert.DeserializeObject<BCItemAttributes>(jRetrieveResponse.ToString());
                return cust.BCItemAttributesProperty;
            }
            return null;

        }
        public async Task<List<BCItemAttributesProperty>> GetListOfItemAttributesTube()
        {
            //items?$filter=af_quantity eq 27 and af_grade eq 'G11' and af_color eq 'Natural' and af_nominalthickness eq '0.125' and af_nominallength eq '15' and af_nominalwidth eq '14.5' and af_kerf eq '0.2'
            var accessToken = await GetTokenAsync();
            string guid = string.Empty;
            HttpClient httpClient = new HttpClient();
            //Default Request Headers needed to be added in the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            //Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            //prod url
            //string baseURL = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/PRODUCTION/api/AtlasFibre/AtlasFibre/v2.0/companies(6547ba53-8c72-ed11-8c34-6045bdd6b029)/itemAttributes?$filter=ItemCategoryCode eq 'LAM ROD'";
            string baseURL = $"{atlasfibre}/itemAttributes?$filter=ItemCategoryCode eq 'LAM TUBE'";

            httpClient.BaseAddress = new Uri(baseURL);
            //Examples of different filters here.
            //var response = httpClient.GetAsync(string.Format("items?$filter=af_quantity eq {0} and af_grade eq '{1}' and af_color eq '{2}' and af_nominalthickness eq '{3}' and af_nominallength eq '{4}' and af_nominalwidth eq '{5}' and af_kerf eq '{6}'",item.Quantity,item.Grade,item.Color,item.NominalThickness,item.NominalLength,item.NominalWidth,item.Kerf)).Result;
            var response = httpClient.GetAsync("").Result;
            if (response.IsSuccessStatusCode)
            {
                var accounts = response.Content.ReadAsStringAsync().Result;

                var jRetrieveResponse = JObject.Parse(accounts);

                dynamic collContacts = JsonConvert.DeserializeObject(jRetrieveResponse.ToString());
                var cust = JsonConvert.DeserializeObject<BCItemAttributes>(jRetrieveResponse.ToString());
                return cust.BCItemAttributesProperty;
            }
            return null;

        }
        public async Task<PostCartResult> PostCartResults(QuoteExport json)
        {
            //return false;
            var accessToken = await GetTokenAsync();
            HttpClient httpClient = new HttpClient();
            // Default Request Headers needed to be added in the HttpClient Object
            httpClient.DefaultRequestHeaders.Add("OData-MaxVersion", "4.0");
            httpClient.DefaultRequestHeaders.Add("OData-Version", "4.0");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            // Set the Authorization header with the Access Token received specifying the Credentials
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            string mainJson = JsonConvert.SerializeObject(json);
            Guid g = Guid.NewGuid();
            var payload = new
            {
                EntryNo = g.ToString(),
                Json = mainJson
            };
            string payloadJson = JsonConvert.SerializeObject(payload);

            // Production URL
            //string baseURL = "https://api.businesscentral.dynamics.com/v2.0/2e880a32-1b1b-4f90-8cde-cc7f11f10656/PRODUCTION/api/AtlasFibre/AtlasFibre/v2.0/companies(6547ba53-8c72-ed11-8c34-6045bdd6b029)/CreatesalesQuotes";
            string baseURL = $"{atlasfibre}/CreatesalesQuotes";


            // Create HttpContent from JSON
            HttpContent content = new StringContent(payloadJson, Encoding.UTF8, "application/json");

            // Use the PostAsync method correctly by passing the URI and content
            var response = await httpClient.PostAsync(baseURL, content);
            string responseContent = await response.Content.ReadAsStringAsync();
            var result = new PostCartResult
            {
                ResponseContent = responseContent,
                IsSuccess = response.IsSuccessStatusCode
            };
            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Error posting data: {response.StatusCode} - {responseContent}");
            }
            else
            {
                Console.WriteLine("Data posted successfully.");
            }
            return result;
        }

    }

}
