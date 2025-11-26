using AtlasConfigurator.Models.BusinessCentral;

namespace AtlasConfigurator.Services
{
    public class PricingRetrieveData
    {
        private readonly Authentication _authentication;
        public PricingRetrieveData(Authentication authentication)
        {
            _authentication = authentication;
        }

        public async Task<BCCustomer> GetCustomerByNo(string customer)
        {
            return await _authentication.GetCustomerByNo(customer);
        }
        public async Task<List<StandardItem>> GetStandardItemByNo(string item)
        {
            return await _authentication.GetStandardItemByNo(item);
        }
        public async Task<BCCustomerPrice> GetPriceListItemByCustomerAndItemNo(string customer, string item, int quantity)
        {
            return await _authentication.GetPriceListItemByCustomerAndItemNo(customer, item, quantity);
        }
    }
}
