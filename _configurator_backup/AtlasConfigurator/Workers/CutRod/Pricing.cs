using AtlasConfigurator.Models.BusinessCentral;
using AtlasConfigurator.Models.CutRod;
using AtlasConfigurator.Models.SmartCut;
using AtlasConfigurator.Models.Transformed;
using AtlasConfigurator.Services;

namespace AtlasConfigurator.Workers.CutRod
{
    public class Pricing
    {
        private readonly PricingRetrieveData _authentication;
        public Pricing(PricingRetrieveData authentication)
        {
            _authentication = authentication;
        }
        public async Task<List<PricedItem>> GetPricing(string Customer, List<ItemAttributes> itemAttributes, int quantity, decimal ToleranceMinusLength, decimal TolerancePlusLength)
        {
            string customer = string.Empty;
            string priceGroup = string.Empty;
            var bcCustomer = await _authentication.GetCustomerByNo(Customer);
            //  var Item = await auth.GetStandardItemByNo(ItemNo);

            //get all the items and stock pricing
            List<PricedItem> stockMaterialItems = new List<PricedItem>();
            BCCustomerPrice bcPricingItems = new BCCustomerPrice();

            //check if customer
            if (bcCustomer.value.Count > 0)
            {
                var customerData = bcCustomer.value.FirstOrDefault();
                customer = customerData.No;
                priceGroup = customerData.Customer_Price_Group;
            }

            foreach (var i in itemAttributes)
            {
                //Looping through list of stock: CE/0.2/Natural - searching by unique sku for each variation
                var itemResult = await _authentication.GetStandardItemByNo(i.ItemNumber);

                foreach (var bc in itemResult)
                {
                    string safe = i.ItemNumber;
                    string mod = safe.Replace("/", "-");
                    var p = new PricedItem
                    {
                        No = i.ItemNumber,
                        SafeNo = mod,
                        Grade = i.NEMAGrade,
                        Diameter = Convert.ToDouble(i.Thicknesses),
                        Length = Convert.ToDouble(i.LengthIn) + 0.25,
                        StockPrice = (decimal)bc.Unit_Price,
                        Description = bc.Description,
                        MinUsablePrice = (decimal)bc.Unit_Price,
                        InventoryCtrl = bc.itemAvailInNorthAmerica,
                        Customer = customer,
                        PriceGroup = priceGroup,
                        ToleranceMinusLength = ToleranceMinusLength,
                        TolerancePlusLength = TolerancePlusLength
                    };
                    stockMaterialItems.Add(p);
                }
                ;
            }



            if (string.IsNullOrEmpty(customer))
            {

                return stockMaterialItems;
            }
            else
            {
                foreach (var i in stockMaterialItems) // --> CESE3/.062 + stock price
                {
                    var salesResult = await _authentication.GetPriceListItemByCustomerAndItemNo(customer, i.No, quantity);

                    bcPricingItems = salesResult;
                    i.SalesCodePrice = (decimal)bcPricingItems.discountedUnitPrice;
                    i.CustomerCardPrice = (decimal)bcPricingItems.discountedUnitPrice;
                    i.MinUsablePrice = (decimal)bcPricingItems.discountedUnitPrice;
                    i.StockPrice = (decimal)bcPricingItems.discountedUnitPrice;
                    i.DiscountPercentage = bcPricingItems.discountedPercentage;
                }

                return stockMaterialItems;

            }
        } //end
        public async Task<List<PricedItem>> GetCutPricing(SmartResponse rs, string customer, decimal diameter, string sku, List<PricedItem> pricedItems, BCCustomer customerResult)
        {
            var stock = rs.Stock.Where(x => x.Used == true).ToList();
            int qty = 0;
            string material = string.Empty;

            foreach (var s in stock)
            {
                qty = qty + 1;
                material = sku;
                diameter = diameter;

                foreach (var p in pricedItems)
                {
                    if (p.SafeNo == s.Name)
                    {
                        p.QuantityUsed = p.QuantityUsed + 1;
                    }
                }
            }
            ;

            return pricedItems;

        }
        public List<PricedItem> AddRebateCalculation(List<PricedItem> pricedItems, List<RemnantRebate> rebates)
        {
            decimal rebatetotal = 0;
            foreach (var r in rebates)
            {
                rebatetotal = rebatetotal + (decimal)r.CustomerRebate;
            }
            foreach (var p in pricedItems)
            {
                foreach (var r in rebates)
                {
                    if (p.SafeNo == r.No)
                    {
                        p.Rebate = p.Rebate + (decimal)r.CustomerRebate;
                    }
                }
            }
            foreach (var p in pricedItems)
            {
                p.TotalAfterRebate = p.MinUsablePrice; //- p.Rebate;
            }

            return pricedItems;
        }
    }
}
