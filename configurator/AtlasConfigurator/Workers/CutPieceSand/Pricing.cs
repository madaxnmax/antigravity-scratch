using AtlasConfigurator.Models.BusinessCentral;
using AtlasConfigurator.Models.CutPieceSand;
using AtlasConfigurator.Models.SmartCut;
using AtlasConfigurator.Models.Transformed;
using AtlasConfigurator.Services;

namespace AtlasConfigurator.Workers.CutPieceSand
{
    public class Pricing
    {
        private readonly PricingRetrieveData _authentication;
        public Pricing(PricingRetrieveData authentication)
        {
            _authentication = authentication;
        }
        public async Task<List<PricedItem>> GetPricing(string Customer, List<ItemAttributes> itemAttributes, int quantity, decimal ToleranceMinusLength, decimal TolerancePlusLength, decimal ToleranceMinusWidth, decimal TolerancePlusWidth, decimal Kerf)
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
                        Size = string.Format("{0}x{1}", i.LengthIn, i.WidthIn),
                        Thickness = Convert.ToDouble(i.Thicknesses),
                        Color = i.Color,
                        Kerf = Convert.ToDouble(Kerf),
                        Length = Convert.ToDouble(i.LengthIn) + 0.25,
                        Width = Convert.ToDouble(i.WidthIn) + 0.25,
                        StockPrice = (decimal)bc.Unit_Price,
                        Description = bc.Description,
                        MinUsablePrice = (decimal)bc.Unit_Price,
                        InventoryCtrl = bc.itemAvailInNorthAmerica,
                        Customer = customer,
                        PriceGroup = priceGroup,
                        ToleranceMinusLength = ToleranceMinusLength,
                        TolerancePlusLength = TolerancePlusLength,
                        ToleranceMinusWidth = ToleranceMinusWidth,
                        TolerancePlusWidth = TolerancePlusWidth
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

                    //list of matching stocks - could be multiple due to expiration dates, etc
                    bcPricingItems = salesResult;

                    decimal price = 0; // Default value
                    if (bcPricingItems != null && bcPricingItems.unitPrice != null)
                    {
                        price = (decimal)bcPricingItems.unitPrice;
                    }

                    i.SalesCodePrice = price;
                    i.CustomerCardPrice = price;
                    i.MinUsablePrice = price;
                    i.StockPrice = price;
                }

                return stockMaterialItems;

            }
        }

        public async Task<List<PricedItem>> GetCutPricing(SmartResponse rs, string customer, decimal thickness, string sku, List<PricedItem> pricedItems, BCCustomer customerResult)
        {
            // Filter and group stock by Name
            var groupedStock = rs.Stock
                .Where(x => x.Used == true)
                .GroupBy(x => x.Name)
                .Select(g => new
                {
                    Name = g.Key,
                    TotalQuantity = g.Sum(s =>
                    {
                        // Sum the quantity, counting non-numeric values as 1
                        if (int.TryParse(s.Stack.ToString(), out int qty))
                        {
                            return qty;
                        }
                        return 1; // Treat non-numeric as 1
                    })
                }).ToList();

            // Loop through the grouped stock and update PricedItems
            foreach (var g in groupedStock)
            {
                foreach (var p in pricedItems)
                {
                    // Check if SafeNo matches Name and update QuantityUsed
                    if (p.SafeNo.ToLower() == g.Name.ToLower())
                    {
                        p.QuantityUsed = g.TotalQuantity;
                    }
                }
            }

            return pricedItems;
        }

        public List<PricedItem> AddRebateCalculation(List<PricedItem> pricedItems, List<RemnantRebate> rebates)
        {
            decimal rebatetotal = 0;
            foreach (var r in rebates)
            {
                rebatetotal = rebatetotal + (decimal)r.TotalOffcutValue;
            }
            foreach (var p in pricedItems)
            {
                foreach (var r in rebates)
                {
                    if (p.SafeNo == r.No)
                    {
                        p.Rebate = p.Rebate + (decimal)r.TotalOffcutValue;
                    }
                }
            }
            foreach (var p in pricedItems)
            {
                p.TotalAfterRebate = (p.MinUsablePrice * p.QuantityUsed) - p.Rebate;
            }

            return pricedItems;
        }
    }
}
