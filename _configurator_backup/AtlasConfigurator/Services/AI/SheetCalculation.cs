using AtlasConfigurator.Helpers.Sheets;
using AtlasConfigurator.Models;
using AtlasConfigurator.Models.AI;
using AtlasConfigurator.Models.Transformed;
using AtlasConfigurator.Workers;
using AtlasConfigurator.Workers.AIWorkers;
using AtlasConfigurator.Workers.CutPieceSand;

namespace AtlasConfigurator.Services.AI
{
    public class SheetCalculation
    {
        private BCItemTransformation _bCItemTransformation;
        private List<ItemAttributes> itemAttributes = new List<ItemAttributes>();
        private SheetHelper _sheetHelper;
        private HashSet<int> allowedDimensions = new HashSet<int> { 36, 48, 96 };
        private CutSheetHelper _helper;
        private CutSheetCalculation _cutSheetCalculation;

        private string selectedSize;
        //public string Customer;


        public SheetCalculation(BCItemTransformation bCItemTransformation, SheetHelper sheetHelper, CutSheetHelper helper, CutSheetCalculation cutSheetCalculation)
        {
            _bCItemTransformation = bCItemTransformation;
            _sheetHelper = sheetHelper;
            _helper = helper;
            _cutSheetCalculation = cutSheetCalculation;
        }

        public List<SheetQuote> sheetQuotes = new List<SheetQuote>();

        public async Task<(List<SheetQuote> sheetquote, string error)> CalcSheet(AIProcessResponse response, string customer, List<ItemAttributes> BCSheets, string connectionId)
        {
            LengthWidth lw = new LengthWidth();
            decimal maskingTotal = 0;
            decimal MaskingPriceOneSides = 15;
            decimal MaskingPriceTwoSides = 20;
            decimal sandingTotal = 0;
            Sanding sand = new Sanding();
            ItemAttributes selectedItem = null;
            Conversions conversions = new Conversions();
            sheetQuotes = new List<SheetQuote>();


            var sheets = conversions.Sheets(response);

            itemAttributes = BCSheets;

            foreach (var sheet in sheets)
            {
                if (allowedDimensions.Contains(sheet.LengthIn) && allowedDimensions.Contains(sheet.WidthIn))
                {
                    var selectedSize = sheet.Size;
                    var sizes = lw.GetLengthWidthFromCombinedSize(selectedSize);


                    List<ItemAttributes> potentialStock = new List<ItemAttributes>();
                    //find the nearest potential stocks
                    decimal thicknessValue = sheet.Thickness;
                    int sandedSides = 0;
                    // Try to parse SandedThickness, default to 0 if it fails.
                    if (!int.TryParse(sheet.NumberofSandedSides, out sandedSides))
                    {
                        sandedSides = 0;
                    }

                    bool fallback = false;
                    if (sandedSides > 0)
                    {
                        var pStocks = _helper.FindNearestStocks(thicknessValue, itemAttributes, sheet.Grade, sheet.Color, true, sheet.WidthIn, sheet.LengthIn);
                        fallback = pStocks.FallBackStocks;
                        potentialStock = pStocks.Stocks;
                    }
                    else
                    {
                        var pStocks = _helper.FindNearestStocks(thicknessValue, itemAttributes, sheet.Grade, sheet.Color, false, sheet.WidthIn, sheet.LengthIn);
                        fallback = pStocks.FallBackStocks;
                        potentialStock = pStocks.Stocks;
                    }
                    if (potentialStock == null || potentialStock.Count <= 0)
                    {
                        return (null, $"Unable to find stock based on {thicknessValue}, {sheet.Grade}, {sheet.Color}");
                    }

                    //// Predicate function to check if an attribute matches the specified conditions
                    //bool MatchesConditions(ItemAttributes attr, int length, int width) =>
                    //    attr.NEMAGrade == sheet.Grade &&
                    //    attr.Thicknesses == sheet.Thickness.ToString() &&
                    //    Convert.ToInt32(attr.LengthIn) == length &&
                    //    Convert.ToInt32(attr.WidthIn) == width &&
                    //    attr.Color.ToLower() == sheet.Color.ToLower() &&
                    //    !attr.ItemNumber.EndsWith("D");

                    //// Attempt to find the item with the original orientation or the rotated orientation
                    //selectedItem = itemAttributes.FirstOrDefault(attr => MatchesConditions(attr, sizes.Length, sizes.Width)) ??
                    //               itemAttributes.FirstOrDefault(attr => MatchesConditions(attr, sizes.Width, sizes.Length));

                    //if (selectedItem == null)
                    //{
                    //    return (null, $"Unable to find stock for: {sheet.Grade} {sheet.Thickness.ToString()} {sheet.Color.ToLower()} {sizes.Length}x{sizes.Width}");
                    //}

                    selectedItem = potentialStock.Where(x => x.MILSpec != null).FirstOrDefault();
                    sheet.Thickness = Convert.ToDecimal(selectedItem.Thicknesses);
                    sheet.Customer = customer;
                    var quantityPricing = await _bCItemTransformation.CalculatePricingForQuantitySimple(Convert.ToInt32(sheet.Quantity), selectedItem.ItemNumber, customer);
                    // Check if pricing was found
                    if (quantityPricing.TotalPrice == 0)
                    {
                        continue;
                    }
                    //masking
                    if (!string.IsNullOrEmpty(sheet.NumberofMaskedSides))
                    {
                        int sides = Convert.ToInt32(sheet.NumberofMaskedSides);
                        if (sides > 0)
                        {
                            if (sides == 1)
                            {
                                maskingTotal = Convert.ToInt32(sheet.Quantity) * MaskingPriceOneSides;
                            }
                            else if (sides == 2)
                            {
                                maskingTotal = Convert.ToInt32(sheet.Quantity) * MaskingPriceTwoSides;
                            }
                        }
                    }

                    //sanding
                    if (!string.IsNullOrEmpty(sheet.SandedThickness))
                    {
                        decimal sandedthick = Convert.ToDecimal(sheet.SandedThickness);
                        if (Convert.ToDecimal(selectedItem.Thicknesses) > sandedthick)
                        {
                            if (sandedthick > 0)
                            {
                                List<ItemAttributes> LItemAtt = new List<ItemAttributes>();
                                LItemAtt.Add(selectedItem);
                                decimal sandedtoleranceminus = decimal.TryParse(sheet.SandedThicknessToleranceMinus, out var result)
                                ? result
                                : 0m;

                                sandingTotal = sand.SheetSandSimple(Convert.ToDecimal(sheet.SandedThickness), sandedtoleranceminus, LItemAtt, Convert.ToInt32(sheet.Quantity));
                            }
                        }

                    }

                    quantityPricing.MaskingTotal = maskingTotal;
                    quantityPricing.SandingTotal = sandingTotal;
                    List<QuantityPricing> qPricing = new List<QuantityPricing>();
                    qPricing.Add(quantityPricing);
                    // Update the sheet quote and invoke the event
                    sheet.Pricing = qPricing;
                    sheet.ItemNo = selectedItem.ItemNumber;

                    sheetQuotes.Add(sheet);
                }
            }
            return (sheetQuotes, null);
        }
    }
}
