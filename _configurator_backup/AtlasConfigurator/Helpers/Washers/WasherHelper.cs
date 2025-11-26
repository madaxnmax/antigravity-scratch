using AtlasConfigurator.Models;
using AtlasConfigurator.Models.Transformed;
using AtlasConfigurator.Workers.CutPieceSand;

namespace AtlasConfigurator.Helpers.Washers
{
    public class WasherHelper
    {
        private const decimal MinimumLotCostExcellon = 210m;
        private const decimal MinimumLotCostRouter = 300m;

        public string GetPanelSizeFromSheetSize(string sheetSize, WasherQuote washerQuote, int quantity)
        {
            // Parse sheet size
            var sizeParts = sheetSize.Split('x');
            if (sizeParts.Length != 2 || !double.TryParse(sizeParts[0], out double sheetWidth) || !double.TryParse(sizeParts[1], out double sheetHeight))
            {
                throw new ArgumentException("Invalid sheet size format. Use 'WidthxHeight' format, e.g., '48x48'.");
            }

            // Parse thickness and sanded thickness
            double thickness = double.TryParse(washerQuote.SandedThickness, out double sandedThicknessValue) && sandedThicknessValue > 0
                ? sandedThicknessValue
                : washerQuote.Thickness;

            // Panel size options
            var panelSizes = new List<(double Width, double Height)>
    {
        (12, 12),
        (12, 18),
        (16, 20),
        (18, 24),
        (18, 48),
        (36, 48),
        (sheetWidth, sheetHeight) // Full sheet size dynamically determined
    };

            // Determine if using Router or Excellon
            bool isRouter = thickness > 0.500;

            // Restrict panel sizes based on machine type
            var restrictedPanelSizes = panelSizes
                .Where(panel => isRouter || (panel.Width <= 22 && panel.Height <= 28)) // Restrict to max Excellon size
                .ToList();

            // Special case: Large diameter for Excellon
            if (!isRouter && washerQuote.OD >= 18)
            {
                double adjustedSize = washerQuote.OD + 0.5;
                double panelSize = Math.Min(adjustedSize, 21.5); // Max allowed for Excellon is 22x22
                return $"{panelSize:F2}x{panelSize:F2}";
            }

            // Calculate yield programmatically for each panel size
            var bestFitPanel = restrictedPanelSizes
                .Select(panel => new
                {
                    Width = panel.Width,
                    Height = panel.Height,
                    Yield = CalculateYield(panel.Width, panel.Height, washerQuote.OD), // Calculate pieces per panel
                })
                .Where(panel => panel.Yield >= quantity) // Only consider panels that meet the quantity
                .OrderBy(panel => panel.Width * panel.Height) // Minimize material waste
                .FirstOrDefault();

            if (bestFitPanel != null)
            {
                return $"{bestFitPanel.Width:F2}x{bestFitPanel.Height:F2}";
            }

            // Default to 18x24 if quantities exceed all other sizes and it's Excellon
            if (!isRouter && quantity > restrictedPanelSizes.Max(panel => CalculateYield(panel.Width, panel.Height, washerQuote.OD)))
            {
                return "18.00x24.00"; // Divides well into most standard sheets
            }

            // Default to full sheet size for large quantities
            if (isRouter)
            {
                return $"{sheetWidth:F2}x{sheetHeight:F2}";
            }
            else
            {
                return "22.00x28.00"; // Max Excellon panel size
            }
        }

        private int CalculateYield(double panelWidth, double panelHeight, double washerOD)
        {
            // Assume washerOD includes any necessary spacing
            int washersPerRow = (int)(panelWidth / washerOD);
            int washersPerColumn = (int)(panelHeight / washerOD);

            // Total yield is rows * columns
            return washersPerRow * washersPerColumn;
        }


        //public string GetPanelSizeFromSheetSize(string sheetSize, WasherQuote washerQuote, int quantity)
        //{
        //    var sizeParts = sheetSize.Split('x');
        //    if (sizeParts.Length != 2 || !double.TryParse(sizeParts[0], out double sheetWidth) || !double.TryParse(sizeParts[1], out double sheetHeight))
        //    {
        //        throw new ArgumentException("Invalid sheet size format. Use 'WidthxHeight' format, e.g., '48x48'.");
        //    }
        //    double thickness;
        //    double sandedThicknessValue;

        //    // Try to parse SandedThickness; if it fails or is null/empty, default to 0.
        //    if (!double.TryParse(washerQuote.SandedThickness, out sandedThicknessValue))
        //    {
        //        sandedThicknessValue = 0; // Default value if parsing fails
        //    }

        //    // Calculate thickness
        //    thickness = washerQuote.Thickness - sandedThicknessValue;
        //    // Determine max panel size based on thickness
        //    double maxPanelWidth = thickness > 0.500 ? Math.Min(sheetWidth, 48) : Math.Min(sheetWidth, 22);
        //    double maxPanelHeight = thickness > 0.500 ? Math.Min(sheetHeight, 96) : Math.Min(sheetHeight, 28);

        //    // Space occupied by each ring: Use OD (effective size for placing)
        //    double ringWidth = washerQuote.OD;
        //    double ringHeight = washerQuote.OD;

        //    // Calculate how many rings fit per row and column
        //    int ringsPerRow = (int)(maxPanelWidth / ringWidth);
        //    int ringsPerColumn = (int)(maxPanelHeight / ringHeight);

        //    // Total rings that fit in the max panel size
        //    int totalRingsInMaxPanel = ringsPerRow * ringsPerColumn;

        //    // Determine required rows based on quantity
        //    int requiredRows = (int)Math.Ceiling((double)quantity / ringsPerRow);

        //    // Calculate dynamic panel dimensions
        //    double panelWidth = ringsPerRow * ringWidth;
        //    double panelHeight = requiredRows * ringHeight;

        //    // Ensure panel dimensions do not exceed max limits
        //    panelWidth = Math.Min(panelWidth, maxPanelWidth);
        //    panelHeight = Math.Min(panelHeight, maxPanelHeight);

        //    return $"{panelWidth:F2}x{panelHeight:F2}";

        //}

        public bool IsRouterRequired(double thickness, string panelSize)
        {
            // Parse panel size to determine dimensions
            var sizeParts = panelSize.Split('x');
            if (sizeParts.Length != 2 || !double.TryParse(sizeParts[0], out double width) || !double.TryParse(sizeParts[1], out double height))
            {
                throw new ArgumentException("Invalid panel size format. Use 'WidthxHeight' format, e.g., '18x24'.");
            }

            // Use Router if thickness > 0.500" or if panel size exceeds 18" x 24"
            return thickness > 0.500 || width > 22 || height > 28;
        }

        public decimal CalculateSandingCost(WasherQuote quote, int panelsNeeded)
        {
            decimal sandingCost = 0;
            if (!string.IsNullOrEmpty(quote.SandedThickness))
            {
                Sanding sand = new Sanding();
                decimal sandedThickness = Convert.ToDecimal(quote.SandedThickness);

                if (sandedThickness > 0 && sandedThickness < (decimal)quote.Thickness)
                {
                    var panelSize = quote.SheetSize.Split('x');
                    decimal sheetLength = Convert.ToDecimal(panelSize[0]);
                    decimal sheetWidth = Convert.ToDecimal(panelSize[1]);
                    decimal sheetThickness = Convert.ToDecimal(quote.Thickness);

                    // Sanding cost per panel multiplied by total panels needed
                    sandingCost = sand.SheetSandSimpleBySheet(
                        sandedThickness,
                        Convert.ToDecimal(quote.ThickMinus),
                        quote.QuantityRequested,
                        sheetLength,
                        sheetWidth,
                        sheetThickness
                    ) * panelsNeeded;
                }
            }
            return sandingCost;
        }

        public int CalculatePanelsPerFullSheet(WasherQuote quote)
        {
            // Parse sheet dimensions
            var sizeParts = quote.SheetSize.Split('x');
            if (sizeParts.Length != 2 || !double.TryParse(sizeParts[0], out double fullSheetWidth) || !double.TryParse(sizeParts[1], out double fullSheetHeight))
            {
                throw new ArgumentException("Invalid sheet size format. Use 'WidthxHeight' format, e.g., '48x36'.");
            }

            // Parse panel dimensions
            var panel = quote.PanelSize.Split('x');
            if (panel.Length != 2 || !double.TryParse(panel[0], out double panelWidth) || !double.TryParse(panel[1], out double panelHeight))
            {
                throw new ArgumentException("Invalid panel size format. Use 'WidthxHeight' format, e.g., '18x48'.");
            }

            // Orientation 1: Panel as is
            int panelsPerRow1 = (int)(fullSheetWidth / panelWidth);
            int panelsPerColumn1 = (int)(fullSheetHeight / panelHeight);
            int totalPanels1 = panelsPerRow1 * panelsPerColumn1;

            // Orientation 2: Rotated panel
            int panelsPerRow2 = (int)(fullSheetWidth / panelHeight);
            int panelsPerColumn2 = (int)(fullSheetHeight / panelWidth);
            int totalPanels2 = panelsPerRow2 * panelsPerColumn2;

            // Return the maximum panels that fit in either orientation
            return Math.Max(totalPanels1, totalPanels2);
        }



        public bool IsRouterRequiredForPanelSize(string panelSize)
        {
            var sizeParts = panelSize.Split('x');
            if (sizeParts.Length != 2 || !double.TryParse(sizeParts[0], out double width) || !double.TryParse(sizeParts[1], out double height))
            {
                throw new ArgumentException("Invalid panel size format. Use 'WidthxHeight' format, e.g., '18x24'.");
            }

            // Router is required if either dimension is larger than 18x24
            return width > 18 || height > 24;
        }

        public int CalculateSheetYield(WasherQuote quote)
        {
            var sizeParts = quote.SheetSize.Split('x');
            double panelWidth = double.Parse(sizeParts[0]);
            double panelHeight = double.Parse(sizeParts[1]);

            // Determine machine type and set kerf accordingly
            bool useRouter = IsRouterRequiredForPanelSize(quote.SheetSize);
            double kerf = useRouter ? 0.400 : 0.150;
            double minimumTolerance = 0.001;

            double effectivePanelWidth = panelWidth - kerf - minimumTolerance;
            double effectivePanelHeight = panelHeight - kerf - minimumTolerance;

            double adjustedOD = quote.OD + quote.ODPlus;
            double itemDiameter = adjustedOD + kerf;

            int itemsPerRow = (int)Math.Floor(effectivePanelWidth / itemDiameter);
            int itemsPerColumn = (int)Math.Floor(effectivePanelHeight / itemDiameter);

            int panelYield = itemsPerRow * itemsPerColumn;
            return panelYield > 0 ? panelYield : 1;
        }
        public int CalculatePanelYield(WasherQuote quote, string size)
        {
            var sizeParts = size.Split('x');
            double panelWidth = double.Parse(sizeParts[0]);
            double panelHeight = double.Parse(sizeParts[1]);

            // Determine machine type and set kerf accordingly
            bool useRouter = IsRouterRequiredForPanelSize(quote.SheetSize);
            double kerf = useRouter ? 0.400 : 0.150;
            double minimumTolerance = 0.001;

            double effectivePanelWidth = panelWidth - kerf - minimumTolerance;
            double effectivePanelHeight = panelHeight - kerf - minimumTolerance;

            double adjustedOD = quote.OD + quote.ODPlus;
            double itemDiameter = adjustedOD + kerf;

            int itemsPerRow = (int)Math.Floor(effectivePanelWidth / itemDiameter);
            int itemsPerColumn = (int)Math.Floor(effectivePanelHeight / itemDiameter);

            int panelYield = itemsPerRow * itemsPerColumn;
            return panelYield > 0 ? panelYield : 1;
        }


        public decimal CalculateMaterialCost(WasherQuote quote, decimal sheetcost)
        {
            // Parse dynamic sheet size (assume format "WidthxHeight")
            var sizeParts = quote.SheetSize.Split('x');
            if (sizeParts.Length != 2 || !double.TryParse(sizeParts[0], out double panelWidth) || !double.TryParse(sizeParts[1], out double panelHeight))
            {
                throw new ArgumentException("Invalid sheet size format. Use 'WidthxHeight' format, e.g., '48x48'.");
            }

            // Adjust panel dimensions based on kerf and tolerance
            double kerf = quote.Thickness <= 0.500 ? 0.150 : 0.4;
            double minimumTolerance = 0.001;
            double effectivePanelWidth = panelWidth - kerf - minimumTolerance;
            double effectivePanelHeight = panelHeight - kerf - minimumTolerance;

            // Adjusted diameter for item fit calculation
            double itemDiameter = quote.OD + quote.ODPlus + kerf;
            int itemsPerRow = (int)Math.Floor(effectivePanelWidth / itemDiameter);
            int itemsPerColumn = (int)Math.Floor(effectivePanelHeight / itemDiameter);

            // Items per panel yield
            int panelYield = itemsPerRow * itemsPerColumn;
            panelYield = panelYield > 0 ? panelYield : 1; // Ensure at least one item per panel

            // Determine number of panels needed based on quantity
            int panelsNeeded = (int)Math.Ceiling((double)quote.QuantityRequested / panelYield);

            // Calculate sheets needed based on panels per sheet yield
            int panelsPerSheet = CalculatePanelsPerFullSheet(quote);
            int sheetsNeeded = (int)Math.Ceiling((double)panelsNeeded / panelsPerSheet);

            // Total material cost calculation
            decimal totalPanelCost = sheetcost * sheetsNeeded;
            return totalPanelCost / quote.QuantityRequested;
        }







        public (decimal totalcost, decimal runtime, decimal margin) CalculateExcellonLaborCost(WasherQuote quote, int panelsNeeded)
        {
            double thickness = double.TryParse(quote.SandedThickness, out double sandedThicknessValue) && sandedThicknessValue > 0
                ? sandedThicknessValue
                : quote.Thickness;
            // Determine thickness multiplier based on thickness
            decimal thicknessMultiplier;

            if (thickness < 0.063)
            {
                thicknessMultiplier = 1.0m;
            }
            else if (thickness <= 0.156)
            {
                thicknessMultiplier = 1.5m;
            }
            else if (thickness <= 0.500)
            {
                thicknessMultiplier = 3.0m;
            }
            else
            {
                throw new ArgumentException("Thickness above 0.500\" is not allowed.");
            }

            // Calculate linear inches
            // For washers: (ID + OD) * PI
            // For discs: OD * PI if ID = 0
            double linearInchesDouble = (quote.ID > 0)
                ? (quote.ID + quote.OD) * Math.PI
                : quote.OD * Math.PI;

            decimal linearInches = (decimal)linearInchesDouble * thicknessMultiplier;

            // Cost per linear inch
            const decimal costPerLinearInch = 0.036m;

            // Cost per piece = linearInches * costPerLinearInch
            decimal costPerPiece = linearInches * costPerLinearInch;
            costPerPiece = Math.Ceiling(costPerPiece * 100) / 100;
            // Total cost for the specified panels
            int quantity = int.Parse(quote.Quantity);
            decimal totalCost = costPerPiece * quantity;

            // Apply the minimum lot cost
            totalCost = Math.Max(totalCost, MinimumLotCostExcellon);

            // runtimePerPiece = costPerPiece (as explained, $/min = runtime in minutes)
            decimal runtimePerPiece = costPerPiece;

            // Now calculate margin based on runtime and quantity
            // thresholdMin = MinimumLaborCostExcellon / runtimePerPiece
            decimal thresholdMin = MinimumLotCostExcellon / runtimePerPiece;
            decimal floorThreshold = thresholdMin * 8m;

            decimal margin;
            if (quantity < thresholdMin)
            {
                // margin = 100% + (quantity * 20 / thresholdMin)
                margin = 100m + ((quantity * 20m) / thresholdMin);
            }
            else
            {
                // margin = 120% - (quantity * 120 / floorThreshold)
                margin = 120m - ((quantity * 120m) / floorThreshold);

                // Cap at 40%
                if (margin < 40m)
                {
                    margin = 40m;
                }
            }
            decimal marginMultiplier = margin / 100m;
            decimal totalMargin = totalCost * marginMultiplier;
            return (totalCost, runtimePerPiece, totalMargin);
        }




        // Method to calculate Router labor cost
        public (decimal totalcost, decimal runtime, decimal margin) CalculateRouterLaborCost(WasherQuote quote, int panelsNeeded, bool isMilling)
        {
            // Determine feed rate
            double feedRate = isMilling ? 20.0 : 40.0; // 20”/min for glass (FR4), 40”/min for phenolic

            // Calculate number of passes
            double thickness = double.TryParse(quote.SandedThickness, out double sandedThicknessValue) && sandedThicknessValue > 0
                ? sandedThicknessValue
                : quote.Thickness;
            decimal thicknessMultiplier;
            int quantity = int.Parse(quote.Quantity);

            if (thickness <= 2)
            {
                thicknessMultiplier = 8m;
            }
            else if (thickness < 4)
            {
                thicknessMultiplier = 8.5m;
            }
            else if (thickness >= 4 && thickness < 5)
            {
                thicknessMultiplier = 9m;
            }
            else if (thickness >= 5 && thickness < 6)
            {
                thicknessMultiplier = 9.5m;
            }
            else if (thickness >= 6)
            {
                thicknessMultiplier = 10m;
            }
            else
            {
                throw new ArgumentException("Thickness above 0.500\" is not allowed.");
            }


            double numberOfPasses = thickness / 0.250;
            if (numberOfPasses < 1)
            {
                numberOfPasses = 1; // If thickness < 0.250, still 1 pass needed.
            }


            double linearInchesDouble;
            if (quote.ID > 0)
            {
                linearInchesDouble = (quote.ID + quote.OD) * Math.PI * numberOfPasses;
            }
            else
            {
                linearInchesDouble = quote.OD * Math.PI * numberOfPasses;
            }

            // Calculate runtime in minutes
            double runtime = linearInchesDouble / feedRate;


            // Cost per minute
            decimal costPerMinute = 2.08m; // $100/hr shop rate = $1.67/min
            const decimal costPerLinearInch = 0.036m;

            decimal linearInches = (decimal)linearInchesDouble * thicknessMultiplier;
            decimal costPerPiece = linearInches * costPerLinearInch;
            costPerPiece = Math.Ceiling(costPerPiece * 100) / 100;
            //decimal runtimePerPiece = costPerPiece;
            decimal thresholdMin = Math.Ceiling(MinimumLotCostRouter / (decimal)runtime);
            decimal floorThreshold = thresholdMin * thicknessMultiplier;

            decimal margin;
            if (quantity < thresholdMin)
            {
                // margin = 100% + (quantity * 20 / thresholdMin)
                margin = 100m + ((quantity * 20m) / thresholdMin);
            }
            else
            {
                // margin = 120% - (quantity * 120 / floorThreshold)
                margin = 120m - ((quantity * 120m) / floorThreshold);

                // Cap at 40%
                if (margin < 35m)
                {
                    margin = 35m;
                }
            }

            // Calculate total cost
            // Total cost = (runtime * costPerMinute * panelsNeeded) + $100 setup
            decimal totalCost = ((decimal)runtime * costPerMinute * int.Parse(quote.Quantity));
            decimal marginMultiplier = margin / 100m;
            decimal totalMargin = totalCost * marginMultiplier;

            // Apply minimum lot cost if necessary
            return (Math.Max(totalCost, MinimumLotCostRouter), (decimal)runtime, totalMargin);
        }


        // Method to calculate linear inches
        public double CalculateLinearInches(double od, double id, double thickness, bool isExcellon)
        {
            double kerf = isExcellon ? 0.150 : 0.400; // 0.150 for Excellon, 0.400 for Router
            double minimumTolerance = 0.001; // New minimum tolerance

            // Adjusted calculation for Excellon kerf and minimum tolerance
            double thicknessMultiplier = isExcellon ? GetThicknessMultiplier(thickness) : 1.0;
            return (od + id + minimumTolerance) * Math.PI * thicknessMultiplier;
        }




        // Helper method to get thickness multiplier for Excellon calculations
        public double GetThicknessMultiplier(double thickness)
        {
            if (thickness < 0.063) return 1.0;
            if (thickness <= 0.156) return 1.5;
            return 3.0;
        }


        // Method to calculate total quote including material, labor, and cutting charge
        public decimal CalculateTotalQuote(WasherQuote quote, int panelsNeeded, int sheetsNeeded, decimal sheetCost)
        {
            decimal materialCost = CalculateMaterialCost(quote, sheetCost) * quote.QuantityRequested;

            var machineData = quote.Thickness <= 0.500
                ? CalculateExcellonLaborCost(quote, panelsNeeded)
                : CalculateRouterLaborCost(quote, panelsNeeded, isMilling: true);
            decimal laborCost = machineData.totalcost;
            decimal sandingCost = CalculateSandingCost(quote, panelsNeeded);

            // Cutting charge per sheet
            const decimal CuttingCharge = 30m;
            decimal totalCuttingCharge = CuttingCharge * sheetsNeeded;

            return materialCost + laborCost + sandingCost + totalCuttingCharge + machineData.margin;
        }

        public List<ItemAttributes> FindNearestStocks(decimal requestedSandedThickness, List<ItemAttributes> itemAttributes, string grade, string color)
        {
            var potentialStocks = itemAttributes
                .Where(x => x.NEMAGrade.ToLower() == grade.ToLower() && x.Color.ToLower() == color.ToLower()) // Filter by Grade and Color
                .Select(x => new
                {
                    Item = x,
                    EffectiveThickness = decimal.TryParse(x.Thicknesses, out var thickness) &&
                                         decimal.TryParse(x.ThickMinus, out var thickMinus)
                                         ? thickness - thickMinus
                                         : (decimal?)null
                })
                .Where(x => x.EffectiveThickness.HasValue && x.EffectiveThickness.Value >= requestedSandedThickness)
                .OrderBy(x => x.EffectiveThickness.Value)
                .ToList();

            // Find the minimum effective thickness
            var minEffectiveThickness = potentialStocks.FirstOrDefault()?.EffectiveThickness;

            // Filter to include only stocks with the minimum effective thickness
            var closestStocks = potentialStocks
                .Where(x => x.EffectiveThickness == minEffectiveThickness)
                .Select(x => x.Item)
                .ToList();

            return closestStocks;
        }
    }
}
