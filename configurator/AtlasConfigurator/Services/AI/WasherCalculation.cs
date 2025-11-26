using AtlasConfigurator.Helpers.Washers;
using AtlasConfigurator.Models;
using AtlasConfigurator.Models.AI;
using AtlasConfigurator.Models.Transformed;
using AtlasConfigurator.Workers;

namespace AtlasConfigurator.Services.AI
{
    public class WasherCalculation
    {
        private BCItemTransformation _bCItemTransformation;
        private WasherHelper _helper;
        private List<ItemAttributes> itemAttributes = new List<ItemAttributes>();


        private const decimal CuttingCharge = 30m;
        private string selectedSize;
        public string Customer;


        public WasherCalculation(BCItemTransformation bCItemTransformation, WasherHelper washerHelper)
        {
            _bCItemTransformation = bCItemTransformation;
            _helper = washerHelper;
        }

        public WasherQuote washerQuote = new WasherQuote();
        public List<WasherQuote> washerQuotes = new List<WasherQuote>();

        public async Task<List<WasherQuote>> CalcWasher(AIProcessResponse response, string customer, List<ItemAttributes> BCSheets)
        {
            itemAttributes = BCSheets;

            washerQuotes = new List<WasherQuote>();
            washerQuote = new WasherQuote();

            foreach (var washer in response.ring_value)
            {
                washerQuote = new WasherQuote();

                washerQuote.Grade = washer.Grade; ;
                washerQuote.Thickness = Convert.ToDouble(washer.Thickness);
                washerQuote.Color = washer.Color;
                washerQuote.OD = Convert.ToDouble(washer.OuterDiameter);
                washerQuote.ODMinus = Convert.ToDouble(washer.RingOuterDiameterToleranceMinus);
                washerQuote.ODPlus = Convert.ToDouble(washer.OuterDiameterTolerancePlus);
                washerQuote.ID = Convert.ToDouble(washer.InnerDiameter);
                washerQuote.IDMinus = Convert.ToDouble(washer.RingInnerDiameterToleranceMinus);
                washerQuote.IDPlus = Convert.ToDouble(washer.InnerDiameterTolerancePlus);
                washerQuote.Quantity = washer.Quantity;

                var potentialStock = _helper.FindNearestStocks(decimal.Parse(washer.Thickness), itemAttributes, washerQuote.Grade, washerQuote.Color);

                //get sheet sizes.
                var stock = itemAttributes
                    .Where(attr => attr.NEMAGrade == washer.Grade
                    && attr.Thicknesses == washer.Thickness
                    && attr.Color.ToLower() == washer.Color.ToLower());

                ItemAttributes selectedStock;
                string stockLength;
                string stockWidth;
                bool sanding = false;

                if (stock.Any())
                {
                    selectedStock = stock.Where(x => x.WidthIn == "36").FirstOrDefault();
                    if (selectedStock == null)
                    {
                        selectedStock = potentialStock.FirstOrDefault();
                    }
                    stockLength = selectedStock.LengthIn;
                    stockWidth = selectedStock.WidthIn;
                }
                else
                {
                    sanding = true;
                    washerQuote.SandedThickness = washer.Thickness;
                    selectedStock = potentialStock.Where(x => x.WidthIn == "36").FirstOrDefault();
                    if (selectedStock == null)
                    {
                        selectedStock = potentialStock.FirstOrDefault();
                    }
                    stockLength = selectedStock.LengthIn;
                    stockWidth = selectedStock.WidthIn;
                }



                selectedSize = $"{stockWidth}x{stockLength}"; //default size

                washerQuote.SheetSize = selectedSize;
                washerQuote.Size = selectedSize;
                washerQuote.ItemNo = selectedStock.ItemNumber;


                //set customer
                Customer = customer;

                try
                {
                    string panelSize = _helper.GetPanelSizeFromSheetSize(selectedSize, washerQuote, int.Parse(washerQuote.Quantity)); // Helper to determine actual panel size
                    washerQuote.PanelSize = panelSize;
                    // Step 1: Calculate panel yield (items per panel)
                    //int itemsPerPanel = _helper.CalculatePanelYield(washerQuote);
                    int itemsPerPanel = _helper.CalculatePanelYield(washerQuote, panelSize);
                    int itemsPerSheet = _helper.CalculateSheetYield(washerQuote);
                    // Step 1b: Calculate how many panels fit within one full sheet
                    int panelsPerFullSheet = _helper.CalculatePanelsPerFullSheet(washerQuote);

                    // Step 1c: Calculate how many items fit in each full sheet
                    int itemsPerFullSheet = itemsPerPanel * panelsPerFullSheet;

                    // Step 2: Calculate the number of full sheets needed
                    int fullSheetsNeeded = (int)Math.Ceiling(Convert.ToDouble(washer.Quantity) / itemsPerSheet);

                    // Step 3: Calculate total panels used
                    int totalPanelsUsed = (int)Math.Ceiling(Convert.ToDouble(washer.Quantity) / itemsPerPanel);


                    // Retrieve the base price per full sheet
                    var quantityPricing = await _bCItemTransformation.CalculatePricingForQuantitySimple(fullSheetsNeeded, washerQuote.ItemNo, Customer);
                    decimal basePricePerFullSheet = quantityPricing.PricePerItem;

                    var priceperpanel = basePricePerFullSheet / panelsPerFullSheet;
                    var priceperpanel2 = priceperpanel * totalPanelsUsed;

                    // Step 4: Calculate total material cost based on the number of full sheets
                    decimal materialCost = basePricePerFullSheet * fullSheetsNeeded;
                    materialCost = priceperpanel2;

                    // Calculate panel size and determine machine type based on thickness and panel size
                    // string panelSize = _helper.GetPanelSizeFromSheetSize(selectedSize); // Helper to determine actual panel size
                    bool useRouter = _helper.IsRouterRequired(washerQuote.Thickness, panelSize); // Updated logic for machine selection

                    // Step 5: Calculate labor cost based on the machine type
                    var machineData = useRouter
                        ? _helper.CalculateRouterLaborCost(washerQuote, totalPanelsUsed, isMilling: true)
                        : _helper.CalculateExcellonLaborCost(washerQuote, totalPanelsUsed);
                    decimal laborCost = machineData.totalcost;
                    // Step 6: Calculate sanding cost if required, based on panels used
                    decimal sandingCost = 0;
                    if (sanding)
                    {
                        decimal sandedThickness = Convert.ToDecimal(washerQuote.SandedThickness);
                        if (sandedThickness > 0 && sandedThickness < (decimal)washerQuote.Thickness)
                        {
                            // Calculate sanding cost per panel and multiply by total panels used
                            sandingCost = _helper.CalculateSandingCost(washerQuote, totalPanelsUsed);
                        }
                        else
                        {
                            string alertMessage = "Sanded Thickness is greater than or equal to Thickness.";

                            break;
                        }
                    }

                    // Step 7: Calculate the cutting charge based on the number of sheets needed
                    decimal cuttingCharge = CuttingCharge * fullSheetsNeeded;

                    // Step 8: Calculate total price per item
                    decimal totalCost = materialCost + laborCost + sandingCost + cuttingCharge + machineData.margin;
                    decimal minimumOrder = 750;

                    // decimal pricePerItem = totalCost / Convert.ToInt32(washer.Quantity);
                    decimal pricePerItem = Math.Max(totalCost, minimumOrder) / Convert.ToInt32(washer.Quantity);


                    // Create a new QuantityPricing entry with the calculated price
                    var pricing = new WasherQuantityPricing(Convert.ToInt32(washer.Quantity), pricePerItem)
                    {
                        PanelsUsed = totalPanelsUsed,
                        SandingTotal = sandingCost,
                        DiscountPercentage = quantityPricing.DiscountPercentage,
                        MaterialCost = materialCost,
                        PanelSize = panelSize,
                        MachineCost = laborCost,
                        SheetCost = basePricePerFullSheet,
                        TotalPanels = totalPanelsUsed,
                        TotalSheets = fullSheetsNeeded,
                        PanelYield = itemsPerPanel,
                        CutCharge = cuttingCharge,
                        Margin = machineData.margin
                    };
                    washerQuote.Pricing.Add(pricing);
                    washerQuotes.Add(washerQuote);
                }
                catch (Exception ex)
                {
                    return null;
                }


            }
            return washerQuotes;
        }


    }
}
