using AtlasConfigurator.Helpers.Sheets;
using AtlasConfigurator.Models;
using AtlasConfigurator.Models.AI;
using AtlasConfigurator.Models.CutPieceSand;
using AtlasConfigurator.Models.Transformed;
using AtlasConfigurator.Workers;
using AtlasConfigurator.Workers.AIWorkers;
using AtlasConfigurator.Workers.CutPieceSand;
using Costing = AtlasConfigurator.Workers.CutPieceSand.Costing;
using Pricing = AtlasConfigurator.Workers.CutPieceSand.Pricing;

namespace AtlasConfigurator.Services.AI
{
    public class CutSheetCalculation
    {
        private BCItemTransformation _bCItemTransformation;
        private CutSheetHelper _helper;
        private List<ItemAttributes> itemAttributes = new List<ItemAttributes>();
        private Pricing _pricing;
        private Optimizations _optimizations;
        private Authentication _authentication;
        private Costing _costing;
        private HashSet<int> allowedDimensions = new HashSet<int> { 36, 48, 96 };


        public CutSheetCalculation(BCItemTransformation bCItemTransformation,
            CutSheetHelper cutSheetHelper,
            Pricing pricing,
            Optimizations optimizations,
            Authentication authentication,
            Costing costing)
        {
            _bCItemTransformation = bCItemTransformation;
            _helper = cutSheetHelper;
            _pricing = pricing;
            _optimizations = optimizations;
            _authentication = authentication;
            _costing = costing;
        }

        public CutPieceSandQuote cutSheetQuote = new CutPieceSandQuote();
        public List<CutPieceSandQuote> cutSheetQuotes = new List<CutPieceSandQuote>();
        public List<QuantityPricing> quantityPricing = new List<QuantityPricing>();

        private decimal KerfData = 0.2M;
        private decimal sandingTotalPerPiece = 0.00M;



        public async Task<(List<CutPieceSandQuote> cutpiecelist, string error)> CalcCutSheet(AIProcessResponse response, string customer, List<ItemAttributes> BCSheets, string connectionId)
        {
            itemAttributes = BCSheets;

            LengthWidth lw = new LengthWidth();
            decimal maskingTotal = 0;
            decimal MaskingPriceOneSides = 15;
            decimal MaskingPriceTwoSides = 20;
            decimal sandingTotal = 0;
            Sanding sand = new Sanding();
            ItemAttributes selectedItem = null;
            Conversions conversions = new Conversions();
            cutSheetQuotes = new List<CutPieceSandQuote>();
            quantityPricing = new List<QuantityPricing>();


            foreach (var sheet in response.sheet_value)
            {
                //if (decimal.TryParse(sheet.Length.ToString(), out decimal length) &&
                //    decimal.TryParse(sheet.Width.ToString(), out decimal width) &&
                //    allowedDimensions.Contains((int)Math.Round(length)) &&
                //    allowedDimensions.Contains((int)Math.Round(width)))
                //{
                //    continue;
                //}
                //else
                //{

                cutSheetQuote = new CutPieceSandQuote();
                //setup the cutSheetQuote
                cutSheetQuote = conversions.CutSheets(sheet);
                cutSheetQuote.LengthPlus = cutSheetQuote.LengthPlus == 0 ? 0.06M : cutSheetQuote.LengthPlus;
                cutSheetQuote.WidthPlus = cutSheetQuote.WidthPlus == 0 ? 0.06M : cutSheetQuote.WidthPlus;
                cutSheetQuote.ThickPlus = cutSheetQuote.ThickPlus == 0 ? 0.010M : cutSheetQuote.ThickPlus;
                cutSheetQuote.ThickMinus = cutSheetQuote.ThickMinus == 0 ? 0.010M : cutSheetQuote.ThickMinus;

                cutSheetQuote.Kerf = 0.2M;
                cutSheetQuote.CustomerMaterialOnly = false;
                cutSheetQuote.CustomMaterialOnly = false;
                cutSheetQuote.SandingOnly = false;
                List<ItemAttributes> potentialStock = new List<ItemAttributes>();
                //find the nearest potential stocks
                decimal thicknessValue = Convert.ToDecimal(sheet.Thickness);
                int sandedSides = 0;
                // Try to parse SandedThickness, default to 0 if it fails.
                if (!int.TryParse(sheet.NumberofSandedSides, out sandedSides))
                {
                    sandedSides = 0;
                }
                if (sandedSides > 0)
                {
                    potentialStock = _helper.FindNearestStocks(thicknessValue, itemAttributes, sheet.Grade, sheet.Color, true).Stocks;
                }
                else
                {
                    potentialStock = _helper.FindNearestStocks(thicknessValue, itemAttributes, sheet.Grade, sheet.Color, false).Stocks;
                }

                if (potentialStock == null || potentialStock.Count <= 0)
                {
                    return (null, $"Unable to find stock based on {decimal.Parse(sheet.Thickness)}, {sheet.Grade}, {sheet.Color}");
                }

                var desiredSizes = new HashSet<string> { "36x48", "96x48", "48x48", "48x36", "48x96" };
                // Define the desired sizes

                // Filter the items based on the given criteria
                var sizes = potentialStock
                    .Where(item => Convert.ToInt32(item.WidthIn) > 0 && Convert.ToInt32(item.LengthIn) > 0) // Ensure both Width and Length are greater than 0
                    .Select(item => $"{item.LengthIn}x{item.WidthIn}") // Create the "Length x Width" string
                    .Where(size => desiredSizes.Contains(size)) // Filter to only desired sizes
                    .Distinct() // Remove duplicates
                    .ToList();

                // Check if only "48x48" exists
                bool only48x48Exists = sizes.Contains("48x48") && sizes.Count == 1;

                // Remove "48x48" if any other sizes are present
                if (!only48x48Exists)
                {
                    potentialStock = potentialStock
                    .Where(item => !(item.LengthIn == "48" && item.WidthIn == "48"))
                    .ToList();
                }

                var selectStock = potentialStock.Where(x => x.MILSpec != null).FirstOrDefault();
                potentialStock = new List<ItemAttributes> { selectStock };
                // Optionally order the sizes
                sizes = sizes.OrderBy(size => size).ToList();


                //set proper L & W
                decimal widthValue = (cutSheetQuote.Width - cutSheetQuote.WidthMinus) + 0.010M;
                decimal lengthValue = (cutSheetQuote.Length - cutSheetQuote.LengthMinus) + 0.010M;

                if (int.Parse(cutSheetQuote.Quantity) > 1000)
                {
                    continue;
                }



                var cutPiece = new CutPiece
                {
                    Width = widthValue,
                    Length = lengthValue,
                    Quantity = Convert.ToInt32(cutSheetQuote.Quantity),
                    Thickness = Convert.ToDecimal(selectStock.Thicknesses),
                    Color = cutSheetQuote.Color,
                    ToleranceMinusWidth = cutSheetQuote.WidthMinus,
                    TolerancePlusWidth = cutSheetQuote.WidthPlus,
                    ToleranceMinusLength = cutSheetQuote.LengthMinus,
                    TolerancePlusLength = cutSheetQuote.LengthPlus,
                    MaterialSelected = cutSheetQuote.Grade
                };

                var checkFit = _helper.CheckFit(potentialStock, lengthValue, widthValue);
                if (!checkFit)
                {
                    continue;
                }

                string i = string.Format("{0}-{1}-{2}", cutPiece.MaterialSelected, cutPiece.Thickness, cutPiece.Color);
                //get pricing
                var total = await _pricing.GetPricing(customer, potentialStock, Convert.ToInt32(cutSheetQuote.Quantity), cutSheetQuote.LengthMinus, cutSheetQuote.LengthPlus, cutSheetQuote.WidthMinus, cutSheetQuote.WidthPlus, cutSheetQuote.Kerf);
                if (total.Count == 0)
                {
                    continue;
                }
                if (total.Where(x => x.StockPrice == 0).Any())
                {
                    total = total.Where(x => x.StockPrice > 0).ToList();
                    if (total.Count == 0)
                    {
                        continue;
                    }
                }

                //cut calculations
                var rs = await _optimizations.CutOptimization(cutPiece, Convert.ToDouble(cutSheetQuote.Kerf), total, connectionId);

                var firstThicknessString = potentialStock.Select(x => x.Thicknesses).FirstOrDefault();

                //sanding
                if (cutSheetQuote.SandedSides > 0 ||
                    !decimal.TryParse(firstThicknessString, out var parsedThickness) ||
                    cutSheetQuote.Thickness != parsedThickness)
                {
                    decimal sandedToleranceMinus = 0M;
                    cutSheetQuote.SandedThickness = decimal.TryParse(sheet.Thickness, out decimal sandedThick) ? sandedThick : 0m;


                    sandingTotal = sand.SheetSand(cutSheetQuote.SandedThickness, cutSheetQuote.ThickMinus, rs.Stock);
                    if (sandingTotal > 0)
                    {
                        sandingTotalPerPiece = sandingTotal / Convert.ToInt32(cutSheetQuote.Quantity);
                    }
                }

                decimal cutCostTotal = await _costing.CostPerCut(total, rs);

                var pdf = rs.File;

                var customerResult = await _authentication.GetCustomerByNo(customer);

                var pricingData = await Task.Run(() => _pricing.GetCutPricing(rs, customer, Convert.ToDecimal(cutPiece.Thickness), i, total, customerResult));

                var offcut = await _optimizations.GetOffcutData(rs, pricingData);

                var finalpricing = _pricing.AddRebateCalculation(pricingData, offcut);

                var pricingResponse = finalpricing.Where(x => x.QuantityUsed > 0).ToList();
                var rebate = offcut;
                //var stockid = rs.Metadata.UsedStockTally.Stock;
                //var stockqty = rs.Metadata.UsedStockTally.Sum(x => x.Qty);
                var stockused = rs.Stock.Where(x => x.Used == true).ToList();

                var totalRebate = offcut.Select(x => x.TotalOffcutValue).Sum();
                var totalStockCost = pricingResponse.Select(x => x.MinUsablePrice).Sum();

                decimal stockTotal = 0;
                foreach (var stock in pricingResponse)
                {
                    var tempTotal = stock.MinUsablePrice * stock.QuantityUsed;
                    stockTotal = stockTotal + tempTotal;
                }

                var groupedStocks = stockused
                           .Where(s => s.L.HasValue && s.W.HasValue && s.T.HasValue) // Ensure L and W have values
                           .GroupBy(s => new { L = s.L.Value, W = s.W.Value, T = s.T.Value, N = s.Name }) // Group by dimensions LxW
                           .Select(group => new
                           {
                               Dimensions = group.Key,
                               Quantity = group.Sum(item => _helper.GetQuantityFromStack(item.Stack)),
                               Width = group.Key.W,
                               Length = group.Key.L,
                               Thickness = group.Key.T,
                               Name = group.Key.N
                           })
                           .ToList();

                var totalstockscount = groupedStocks.Sum(x => x.Quantity);
                if (cutSheetQuote.MaskingSides > 0)
                {
                    if (cutSheetQuote.MaskingSides == 1)
                    {
                        maskingTotal = totalstockscount * MaskingPriceOneSides;
                    }
                    else if (cutSheetQuote.MaskingSides == 2)
                    {
                        maskingTotal = totalstockscount * MaskingPriceTwoSides;
                    }
                }

                decimal customerFinalTotal = ((stockTotal - totalRebate) + cutCostTotal + sandingTotal + maskingTotal);
                customerFinalTotal = Math.Round(customerFinalTotal / Convert.ToDecimal(cutSheetQuote.Quantity), 2);

                var returnData = new CutPieceSandPricing
                {
                    TotalCustomerCostPerPiece = customerFinalTotal,
                    TotalCustomerCostTimesQuantity = customerFinalTotal * Convert.ToInt32(cutSheetQuote.Quantity),
                    StockTotal = stockTotal,
                    RebateTotal = totalRebate,
                    CutCostTotal = cutCostTotal,
                    MaskingTotal = maskingTotal,
                    SandingTotal = sandingTotal,
                    Quantity = Convert.ToInt32(cutSheetQuote.Quantity),
                    PDF = rs.File,
                    StockUsed = groupedStocks.Select(x => new FinalUsedStock
                    {
                        StockSku = x.Name,
                        Length = x.Length,
                        Width = x.Width,
                        StockQty = x.Quantity,
                        IdealYield = 0
                    }).ToList()
                };
                cutSheetQuote.CutPieceSandQuantityPricing.Add(returnData);

                // Filter and select the appropriate stock
                FinalUsedStock selectedStock = null;

                foreach (var stock in returnData.StockUsed)
                {
                    if (stock.Length == 96.25 && stock.Width == 48.25)
                    {
                        selectedStock = stock;
                        break;
                    }
                }

                if (selectedStock == null)
                {
                    foreach (var stock in returnData.StockUsed)
                    {
                        if (stock.Length == 48.25 && stock.Width == 36.25)
                        {
                            selectedStock = stock;
                            break;
                        }
                    }
                }

                if (selectedStock == null)
                {
                    foreach (var stock in returnData.StockUsed)
                    {
                        if (stock.Length == 48.25 && stock.Width == 48.25)
                        {
                            selectedStock = stock;
                            break;
                        }
                    }
                }

                CutPieceSandQuote cut = new CutPieceSandQuote();
                cut = cutSheetQuote;

                // Assuming CutPieceSandQuantityPricing is a list of objects with Quantity, TotalCustomerCostPerPiece, and TotalCustomerCostTimesQuantity
                var cutPieces = cut.CutPieceSandQuantityPricing;

                // Sort the list by quantity to ensure proper comparison order
                cutPieces.Sort((a, b) => a.Quantity.CompareTo(b.Quantity));

                // Initialize the lowest price encountered so far with a very high value
                decimal lowestPriceSoFar = decimal.MaxValue;

                // Iterate through the sorted list
                foreach (var c in cutPieces)
                {
                    // Check if the current price is higher than the lowest price encountered so far
                    if (c.TotalCustomerCostPerPiece > lowestPriceSoFar)
                    {
                        // If yes, set the current price to the lowest price
                        c.TotalCustomerCostPerPiece = lowestPriceSoFar;
                    }
                    else
                    {
                        // If no, update the lowest price so far
                        lowestPriceSoFar = c.TotalCustomerCostPerPiece;
                    }

                    // Update the total cost times quantity
                    c.TotalCustomerCostTimesQuantity = c.TotalCustomerCostPerPiece * c.Quantity;
                }

                cut.CutPieceSandQuantityPricing = cutPieces;
                cutSheetQuotes.Add(cut);

                // }
            }

            return (cutSheetQuotes, null);
        }

    }
}
