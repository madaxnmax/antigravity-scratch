using AtlasConfigurator.Models;
using AtlasConfigurator.Models.CutRod;
using AtlasConfigurator.Models.Transformed;
using AtlasConfigurator.Services;
using AtlasConfigurator.Workers.CutRod;
using CutPiece = AtlasConfigurator.Models.CutRod.CutPiece;
using FinalUsedStock = AtlasConfigurator.Models.CutRod.FinalUsedStock;
using Optimizations = AtlasConfigurator.Workers.CutRod.Optimizations;
using Pricing = AtlasConfigurator.Workers.CutRod.Pricing;

namespace AtlasConfigurator.Helpers.Rods
{
    public class CutRodHelper
    {
        private Pricing _pricing;
        private Optimizations _optimizations;
        private Authentication _authentication;

        public CutRodHelper(Pricing pricing, Optimizations optimizations, Authentication authentication)
        {
            _pricing = pricing;
            _optimizations = optimizations;
            _authentication = authentication;
        }
        public async Task<CutRodPricing> SetupCutRodPricing(CutPiece cutPiece, string customer, CutRodQuote cutRodQuote, List<ItemAttributes> stocks, string connectionId)
        {
            string i = string.Format("{0}/{1}", cutPiece.Grade, cutPiece.Diameter);

            // 1) Get Pricing / run the RodCutOptimization
            var total = await _pricing.GetPricing(customer, stocks, Convert.ToInt32(cutRodQuote.Quantity), cutRodQuote.LengthMinus, cutRodQuote.LengthPlus);
            var rs = RodCutOptimization(cutPiece, total, Convert.ToDouble(cutRodQuote.Kerf));
            var customerResult = await _authentication.GetCustomerByNo(customer);

            // 2) Check if this item is "Rolled"
            bool isRolled = stocks
                .Select(x => x.NEMAGrade)
                .FirstOrDefault()
                ?.Contains("(Rolled)") == true;

            // 3) Common data
            double thick = Convert.ToDouble(cutPiece.Diameter);
            int quantity = Convert.ToInt32(cutRodQuote.Quantity);
            double pieceLength = (double)cutPiece.Length;

            // 4) We'll still do the cut-cost logic as normal
            double cutCost = 0.00;
            if (thick < 0.5)
            {
                cutCost = 0.50;
            }
            else if (thick < 1.25)
            {
                cutCost = 1.00;
            }
            else if (thick < 2.5)
            {
                cutCost = 1.50;
            }
            else
            {
                cutCost = 4.00;
            }

            // The number of cuts from the optimization
            int numCuts = rs.NumberOfCuts;
            if (numCuts == 0)
            {
                // fallback to the pieces-per-rod from the optimization logic
                numCuts = rs.PiecesPerRod;
            }

            double formula = Math.Round(numCuts * cutCost, 2);
            if (formula < 30)
            {
                formula = 30;
            }
            double cutCostTotal = formula;

            // -------------------------------------------------------------
            // SHORT-CIRCUIT FOR "Rolled" (priced by the rod, not by the foot)
            // -------------------------------------------------------------
            if (isRolled)
            {
                // Force rod length to 46 for consistency
                int rodL = 46;

                // We'll assume MinUsablePrice is the cost PER 46" rod,
                // not a "per foot" cost for these rolled items.
                decimal pricePerRod = total.Select(x => x.MinUsablePrice).FirstOrDefault();

                // We rely on the RodCutOptimization result for how many rods are needed:
                int rodsNeeded = rs.NumberOfStocksUsed;

                // Material cost for all rods
                decimal stockTotal = rodsNeeded * pricePerRod;

                // Combine stock cost + cut cost
                decimal combined = stockTotal + (decimal)cutCostTotal;

                // Cost per piece
                decimal costPerPiece = Math.Round(combined / quantity, 2);

                // Build the final return data
                return new CutRodPricing
                {
                    // Price per piece
                    TotalCustomerCostPerPiece = costPerPiece,

                    // Extended total for quantity
                    TotalCustomerCostTimesQuantity = costPerPiece * quantity,

                    // The "stock total" portion (just the rods)
                    StockTotal = stockTotal,

                    // We typically don't do a leftover "rebate" for rolled items
                    RebateTotal = 0,

                    // The total cut cost
                    CutCostTotal = (decimal)cutCostTotal,

                    // # of pieces
                    Quantity = quantity,

                    // Info about the stock used
                    StockUsed = stocks.Select(x => new FinalUsedStock
                    {
                        StockSku = x.ItemNumber,
                        Length = Convert.ToDouble(x.LengthIn),
                        Width = Convert.ToDouble(x.WidthIn),
                        // This field is typically how many "feet" or "pieces" used,
                        // but you can tailor it. We'll just store how many rods we used here:
                        StockQty = rodsNeeded,
                        UOM = "EA"
                    }).ToList(),

                    // If we want to preserve discount data
                    DiscountPercentage = total.Select(x => x.DiscountPercentage).FirstOrDefault()
                };
            }
            // -------------------------------------------------------------
            // ELSE:  RUN YOUR EXISTING FOOT-BASED LOGIC (unchanged)
            // -------------------------------------------------------------
            else
            {
                int rodL = 48;
                int Increment = 12;
                double totalPrice = 0;
                decimal pricePerFoot = 0;
                double totalRebateG2 = 0;
                double netAmount = 0;
                decimal stockTotal = 0;

                if (thick < 2)
                {
                    // Basic approach for diameter < 2
                    double piecesPerRod = Math.Floor(rodL / pieceLength);
                    double requiredLengths = quantity / piecesPerRod;
                    double ftPerLength = rodL / 12;
                    double requiredLengthConsuming = requiredLengths * ftPerLength;

                    // Material price
                    pricePerFoot = total.Select(x => x.MinUsablePrice).FirstOrDefault();
                    decimal materialprice = pricePerFoot * (decimal)requiredLengthConsuming;

                    // We'll store in stockTotal
                    stockTotal = materialprice;
                }
                else
                {
                    // More complex approach for diameter >= 2
                    int Increment12 = 12;
                    int roundedPieceLength = RoundUpToNearestIncrement(pieceLength, Increment12);

                    pricePerFoot = total.Select(x => x.MinUsablePrice).FirstOrDefault();

                    int piecesPerRodG2 = rodL / roundedPieceLength;
                    int totalRodsNeeded = (int)Math.Ceiling((double)quantity / piecesPerRodG2);
                    double totalLengthConsumed = totalRodsNeeded * rodL;

                    // The "foot-based" cost for the total rods used
                    double totalPriceG2 = CalculateTotalPrice(totalLengthConsumed, (double)pricePerFoot);

                    // Step 1: total consumption
                    double totalConsumption = pieceLength * quantity;

                    // Step 2: round up to nearest 12
                    double roundedConsumption = Math.Ceiling(totalConsumption / Increment12) * Increment12;

                    // Step 3: leftover
                    double actualRemnantLength = roundedConsumption - totalConsumption;

                    // Step 4: rebate
                    double rebatePerInch = (double)(pricePerFoot / 12);
                    double totalRebate2 = actualRemnantLength * rebatePerInch;
                    totalRebateG2 = totalRebate2;

                    // net
                    totalPrice = (roundedConsumption / 12) * (double)pricePerFoot;
                    netAmount = totalPrice - totalRebate2;

                    // We'll store final foot-based cost in stockTotal
                    stockTotal = (decimal)totalPrice;
                }

                // If totalPrice was set, override
                if (totalPrice > 0)
                {
                    stockTotal = (decimal)totalPrice;
                }
                else
                {
                    // fallback for smaller diameters
                    stockTotal = stockTotal; // already set
                }

                decimal customerFinalTotal = stockTotal + (decimal)cutCostTotal;
                customerFinalTotal = Math.Round(customerFinalTotal / quantity, 2);

                // Build your final return
                // For diameter < 2
                if (thick < 2)
                {
                    return new CutRodPricing
                    {
                        TotalCustomerCostPerPiece = customerFinalTotal,
                        TotalCustomerCostTimesQuantity = customerFinalTotal * quantity,
                        StockTotal = stockTotal,
                        RebateTotal = 0,
                        CutCostTotal = (decimal)cutCostTotal,
                        Quantity = quantity,
                        StockUsed = stocks.Select(x => new FinalUsedStock
                        {
                            StockSku = x.ItemNumber,
                            Length = Convert.ToDouble(x.LengthIn),
                            Width = Convert.ToDouble(x.WidthIn),
                            StockQty = ((int)rs.TotalLengthUsed / 12),
                            UOM = "FT"
                        }).ToList(),
                        DiscountPercentage = total.Select(x => x.DiscountPercentage).FirstOrDefault()
                    };
                }
                else
                {
                    // If diameter >= 2
                    var finalTotal = (decimal)netAmount + (decimal)cutCostTotal;

                    return new CutRodPricing
                    {
                        TotalCustomerCostPerPiece = finalTotal / quantity,
                        TotalCustomerCostTimesQuantity = finalTotal,
                        StockTotal = stockTotal,
                        RebateTotal = (decimal)totalRebateG2,
                        CutCostTotal = (decimal)cutCostTotal,
                        Quantity = quantity,
                        StockUsed = stocks.Select(x => new FinalUsedStock
                        {
                            StockSku = x.ItemNumber,
                            Length = Convert.ToDouble(x.LengthIn),
                            Width = Convert.ToDouble(x.WidthIn),
                            StockQty = ((int)rs.TotalLengthUsed / 12),
                            UOM = "FT"
                        }).ToList(),
                        DiscountPercentage = total.Select(x => x.DiscountPercentage).FirstOrDefault()
                    };
                }
            }
        }


        public int RoundUpToNearestIncrement(double length, int increment)
        {
            return (int)Math.Ceiling(length / increment) * increment;
        }

        public double CalculateTotalPrice(double lengthInInches, double pricePerFoot)
        {
            double lengthInFeet = lengthInInches / 12.0;
            return lengthInFeet * pricePerFoot;
        }

        public double CalculateRebate(int roundedLength, int rodLength, double rebatePerInch)
        {
            int remnantLength = rodLength - roundedLength;
            return remnantLength * rebatePerInch;
        }
        public double CalculateTotalRebate(int rodsNeeded, double remnantLength, double rebatePerInch)
        {
            return remnantLength * rebatePerInch * rodsNeeded;
        }

        public int GetQuantityFromStack(object stack)
        {
            // Convert the stack object to a string.
            string stackAsString = Convert.ToString(stack);

            // If the string representation contains a decimal point, ignore it.
            if (stackAsString.Contains("."))
            {
                return 0;
            }

            // Check for "False" interpreted as quantity 1.
            if (stackAsString.Trim().Equals("False", StringComparison.OrdinalIgnoreCase))
            {
                return 4;
            }

            // Try parsing the string as an integer.
            if (int.TryParse(stackAsString, out int intValue))
            {
                return intValue * 4; // Use the integer value as the quantity.
            }

            // All other cases, including non-numeric strings or bool true, are ignored.
            return 0;
        }
        public bool IsMultipleOf6Or16(decimal value)
        {
            if (value == 0)
            {
                return false;
            }
            return value % 6 == 0 || value % 16 == 0;
        }
        public bool IsDivisorOf48(decimal number)
        {
            return 48 % number == 0;
        }
        public CuttingOptimizationResult RodCutOptimization(
            CutPiece cutPiece,
            List<PricedItem> pricedItems,
            double kerf)
        {
            // kerf = 0;
            var result = new CuttingOptimizationResult();

            // Validate inputs
            if (cutPiece == null || pricedItems == null || !pricedItems.Any())
            {
                throw new ArgumentException("Invalid input parameters");
            }

            // Calculate stack height
            const double maxHeight = 2.5;
            result.StackHeight = cutPiece.Diameter >= 2
                ? 1
                : (int)Math.Floor(maxHeight / (double)cutPiece.Diameter);

            // Find matching stock item (assuming we match by Grade and Diameter)
            //var stockItem = pricedItems.FirstOrDefault(item =>
            //    item.Grade == cutPiece.Grade &&
            //    Math.Abs(item.Diameter - (double)cutPiece.Diameter) < 0.0001);

            var stockItem = pricedItems.FirstOrDefault(item =>
        Math.Abs(item.Diameter - (double)cutPiece.Diameter) < 0.0001);

            if (stockItem == null)
            {
                throw new Exception("No matching stock item found");
            }

            // Calculate piece length range with tolerances
            decimal minPieceLength = cutPiece.Length - cutPiece.ToleranceMinusLength;
            decimal maxPieceLength = cutPiece.Length + cutPiece.TolerancePlusLength;
            decimal nominalPieceLengthWithKerf = cutPiece.Length + (decimal)kerf;
            decimal minPieceLengthWithKerf = minPieceLength + (decimal)kerf;
            decimal maxPieceLengthWithKerf = maxPieceLength + (decimal)kerf;

            // Calculate total length required (using nominal length for material usage)
            decimal totalLengthRequired = nominalPieceLengthWithKerf * cutPiece.Quantity;

            // Calculate pieces per stock rod based on maximum and minimum lengths
            decimal stockLength = (decimal)stockItem.Length;
            int piecesPerRodMax = (int)Math.Floor(stockLength / maxPieceLengthWithKerf);
            int piecesPerRodMin = (int)Math.Floor(stockLength / minPieceLengthWithKerf);

            // Use the minimum of pieces per rod to ensure both max and min tolerances are met
            result.PiecesPerRod = Math.Min(piecesPerRodMax, piecesPerRodMin); // Ensures both max and min tolerance are respected
            result.IsWithinTolerance = piecesPerRodMax <= piecesPerRodMin; // Check if tolerances are met

            // Calculate number of stocks needed
            int totalStocksNeeded = (int)Math.Ceiling((double)cutPiece.Quantity / result.PiecesPerRod);

            // Calculate number of cuts
            int fullRods = cutPiece.Quantity / result.PiecesPerRod;
            int remainingPieces = cutPiece.Quantity % result.PiecesPerRod;

            // Calculate cuts in full rods (one cut less than the pieces per rod)
            int cutsInFullRods = fullRods * (result.PiecesPerRod - 1);

            // Calculate cuts in the last rod (only subtract 1 cut if there are remaining pieces)
            int cutsInLastRod = remainingPieces > 0 ? remainingPieces - 1 : 0;

            // Add up the cuts from full rods and the last rod
            result.NumberOfCuts = cutsInFullRods + cutsInLastRod;

            // Calculate the number of rods used
            result.NumberOfStocksUsed = totalStocksNeeded;

            // Total length used is based on the nominal length required
            result.TotalLengthUsed = totalLengthRequired;

            return result;
        }

    }
}
