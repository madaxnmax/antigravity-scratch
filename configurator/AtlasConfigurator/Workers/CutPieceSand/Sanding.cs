using AtlasConfigurator.Models.SmartCut;
using AtlasConfigurator.Models.Transformed;

namespace AtlasConfigurator.Workers.CutPieceSand
{
    public class Sanding
    {
        public decimal SheetSand(decimal SandedRequest, decimal SandedToleranceMinus, List<ResponseStock> Stock)
        {
            decimal thicknessMulti = 0.000289m;
            decimal minimumPrice = 60M;
            decimal setupChargeBaseValue = 40M;
            decimal setupCharge = 0M;
            decimal FinishedSandedThickness = 0M;
            decimal FinishedSheetSandedAmountThickness = 0M;
            decimal Difference = 0M;
            decimal SheetArea = 0M;
            decimal TotalPrice = 0M;
            int sheetQuantity = 0;

            var groupedStocks = Stock
                .Where(s => s.L.HasValue && s.W.HasValue && s.T.HasValue) // Ensure L and W have values
                .GroupBy(s => new { L = s.L.Value, W = s.W.Value, T = s.T.Value }) // Group by dimensions LxW
                .Select(group => new
                {
                    Dimensions = group.Key,
                    Quantity = group.Sum(item => GetQuantityFromStack(item.Stack)),
                    Width = group.Key.W,
                    Length = group.Key.L,
                    Thickness = group.Key.T
                })
                .ToList();

            foreach (var g in groupedStocks)
            {
                sheetQuantity = g.Quantity;
                //Setup Fee 1 Sheet = $40 Default
                if (sheetQuantity > 1)
                {
                    setupCharge = setupChargeBaseValue / sheetQuantity;
                }

                //Sanded thickness after tolerance
                FinishedSandedThickness = SandedRequest - SandedToleranceMinus;

                //sets thicknessMulti
                if (FinishedSandedThickness >= 0.022m && FinishedSandedThickness <= 1.000m)
                {
                    thicknessMulti = 0.000174m;
                }
                else if (FinishedSandedThickness > 1.000m && FinishedSandedThickness <= 1.500m)
                {
                    thicknessMulti = 0.000231m;
                }
                else if (FinishedSandedThickness > 1.500m && FinishedSandedThickness <= 6.000m)
                {
                    thicknessMulti = 0.000289m;
                }
                // Finished Sheet thickness after sanding
                FinishedSheetSandedAmountThickness = Convert.ToDecimal(g.Thickness) - Convert.ToDecimal(FinishedSandedThickness);
                FinishedSheetSandedAmountThickness = FinishedSheetSandedAmountThickness * 1000;
                SheetArea = Convert.ToDecimal(g.Length) * Convert.ToDecimal(g.Width);

                Difference = FinishedSheetSandedAmountThickness * (thicknessMulti * SheetArea);

                TotalPrice = TotalPrice + Difference;

                TotalPrice = TotalPrice + setupCharge;
            }

            if (TotalPrice < minimumPrice)
            {
                TotalPrice = minimumPrice;
            }

            return TotalPrice;

        }
        public decimal SheetSandSimple(decimal SandedRequest, decimal SandedToleranceMinus, List<ItemAttributes> Stocks, int quantity)
        {
            decimal thicknessMulti = 0.000289m;
            decimal minimumPrice = 60M;
            decimal setupChargeBaseValue = 40M;
            decimal setupCharge = 0M;
            decimal FinishedSandedThickness = 0M;
            decimal FinishedSheetSandedAmountThickness = 0M;
            decimal Difference = 0M;
            decimal SheetArea = 0M;
            decimal TotalPrice = 0M;
            int sheetQuantity = 0;

            var stock = Stocks.FirstOrDefault();
            decimal sheetLength = Convert.ToDecimal(stock.LengthIn);
            decimal sheetWidth = Convert.ToDecimal(stock.WidthIn);
            decimal sheetThickness = Convert.ToDecimal(stock.Thicknesses);


            sheetQuantity = quantity;
            //Setup Fee 1 Sheet = $40 Default
            if (sheetQuantity > 1)
            {
                setupCharge = setupChargeBaseValue / sheetQuantity;
            }

            //Sanded thickness after tolerance
            FinishedSandedThickness = SandedRequest - SandedToleranceMinus;

            //sets thicknessMulti
            if (FinishedSandedThickness >= 0.022m && FinishedSandedThickness <= 1.000m)
            {
                thicknessMulti = 0.000174m;
            }
            else if (FinishedSandedThickness > 1.000m && FinishedSandedThickness <= 1.500m)
            {
                thicknessMulti = 0.000231m;
            }
            else if (FinishedSandedThickness > 1.500m && FinishedSandedThickness <= 6.000m)
            {
                thicknessMulti = 0.000289m;
            }
            // Finished Sheet thickness after sanding
            FinishedSheetSandedAmountThickness = Convert.ToDecimal(sheetThickness) - Convert.ToDecimal(FinishedSandedThickness);
            FinishedSheetSandedAmountThickness = FinishedSheetSandedAmountThickness * 1000;
            SheetArea = Convert.ToDecimal(sheetLength) * Convert.ToDecimal(sheetWidth);

            Difference = FinishedSheetSandedAmountThickness * (thicknessMulti * SheetArea);

            TotalPrice = TotalPrice + Difference;

            TotalPrice = TotalPrice + setupCharge;


            if (TotalPrice < minimumPrice)
            {
                TotalPrice = minimumPrice;
            }

            return TotalPrice;

        }
        public decimal SheetSandSimpleBySheet(decimal SandedRequest, decimal SandedToleranceMinus, int quantity, decimal sheetLength, decimal sheetWidth, decimal sheetThickness)
        {
            decimal thicknessMulti = 0.000289m;
            decimal minimumPrice = 60M;
            decimal setupChargeBaseValue = 40M;
            decimal setupCharge = 0M;
            decimal FinishedSandedThickness = 0M;
            decimal FinishedSheetSandedAmountThickness = 0M;
            decimal Difference = 0M;
            decimal SheetArea = 0M;
            decimal TotalPrice = 0M;
            int sheetQuantity = 0;

            sheetQuantity = quantity;
            //Setup Fee 1 Sheet = $40 Default
            if (sheetQuantity > 1)
            {
                setupCharge = setupChargeBaseValue / sheetQuantity;
            }

            //Sanded thickness after tolerance
            FinishedSandedThickness = SandedRequest - SandedToleranceMinus;

            //sets thicknessMulti
            if (FinishedSandedThickness >= 0.022m && FinishedSandedThickness <= 1.000m)
            {
                thicknessMulti = 0.000174m;
            }
            else if (FinishedSandedThickness > 1.000m && FinishedSandedThickness <= 1.500m)
            {
                thicknessMulti = 0.000231m;
            }
            else if (FinishedSandedThickness > 1.500m && FinishedSandedThickness <= 6.000m)
            {
                thicknessMulti = 0.000289m;
            }
            // Finished Sheet thickness after sanding
            FinishedSheetSandedAmountThickness = Convert.ToDecimal(sheetThickness) - Convert.ToDecimal(FinishedSandedThickness);
            FinishedSheetSandedAmountThickness = FinishedSheetSandedAmountThickness * 1000;
            SheetArea = Convert.ToDecimal(sheetLength) * Convert.ToDecimal(sheetWidth);

            Difference = FinishedSheetSandedAmountThickness * (thicknessMulti * SheetArea);

            TotalPrice = TotalPrice + Difference;

            TotalPrice = TotalPrice + setupCharge;


            if (TotalPrice < minimumPrice)
            {
                TotalPrice = minimumPrice;
            }

            return TotalPrice;

        }
        private static int GetQuantityFromStack(object stack)
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
                return 1;
            }

            // Try parsing the string as an integer.
            if (int.TryParse(stackAsString, out int intValue))
            {
                return intValue; // Use the integer value as the quantity.
            }

            // All other cases, including non-numeric strings or bool true, are ignored.
            return 0;
        }




    }
}
