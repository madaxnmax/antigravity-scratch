using AtlasConfigurator.Models.BusinessCentral;
using AtlasConfigurator.Services;

namespace AtlasConfigurator.Workers
{
    public class GetSheetPricing
    {
        private readonly Authentication _authentication;
        public GetSheetPricing(Authentication authentication)
        {
            _authentication = authentication;
        }
        public async Task<decimal> GetPricing(string customer, string item, int quantity)
        {
            string priceGroup = string.Empty;
            BCCustomer bcCustomer = new BCCustomer();
            decimal salesCodePrice = 0M;
            BCCustomerPrice itemPriceListPricing = new BCCustomerPrice();
            Customer customerData = new Customer();

            //get standard pricing first
            var itemStandardPricing = await _authentication.GetStandardItemByNo(item);
            salesCodePrice = (decimal)itemStandardPricing.Where(x => x.Unit_Price != 0).Select(x => x.Unit_Price).FirstOrDefault();

            //get BC customer & check for custom pricing
            if (!string.IsNullOrEmpty(customer))
            {
                bcCustomer = await _authentication.GetCustomerByNo(customer);
                customerData = bcCustomer.value.FirstOrDefault();


                if (customerData != null)
                {
                    priceGroup = customerData.Customer_Price_Group;
                    if (!string.IsNullOrEmpty(priceGroup))
                    {
                        itemPriceListPricing = await _authentication.GetPriceListItemByCustomerAndItemNo(customer, item, quantity);
                    }
                }
            }

            List<decimal> prices = new List<decimal>();

            // Add valid (non-zero) prices to the list
            if ((decimal)itemPriceListPricing.unitPrice > 0)
            {
                prices.Add((decimal)itemPriceListPricing.unitPrice);
            }

            if ((decimal)itemPriceListPricing.discountedUnitPrice > 0)
            {
                prices.Add((decimal)itemPriceListPricing.discountedUnitPrice);
            }

            if (salesCodePrice > 0)
            {
                prices.Add(salesCodePrice);
            }

            // Return the lowest price, or 0 if no valid prices are found
            return prices.Any() ? prices.Min() : 0;


        }
    }
}
