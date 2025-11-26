using AtlasConfigurator.Models.CutAlgorithm;
using AtlasConfigurator.Models.CutPieceSand;
using AtlasConfigurator.Models.SmartCut;
using GuillotineOptions = AtlasConfigurator.Models.CutAlgorithm.GuillotineOptions;
using Part = AtlasConfigurator.Models.CutAlgorithm.Part;
using Saw = AtlasConfigurator.Models.CutAlgorithm.Saw;
using Stock = AtlasConfigurator.Models.CutAlgorithm.Stock;

namespace AtlasConfigurator.Services.CutAlgorithm
{
    public class OptimizationCalculation
    {
        public async Task<SmartResponse> CutOptimization(CutPiece cutPiece, double kerf, List<PricedItem> pricedItems)
        {
            //get all sheets that match material & thickness todo
            double maxHeight = 2.5;
            int stackHeight = 0;
            List<Stock> stocks = new List<Stock>();
            //limit of 1000 stock on current plan. Reduce larges stock count down to total equal of 1000
            var totalStock = pricedItems.Sum(x => x.InventoryCtrl);
            while (totalStock > 1000)
            {
                // Find the stock with the largest count
                PricedItem largestStock = pricedItems.OrderByDescending(x => x.InventoryCtrl).First();

                // Calculate the reduction amount for the largest stock
                var reductionAmount = Math.Min(totalStock - 1000, largestStock.InventoryCtrl);

                // Reduce the largest stock count
                largestStock.InventoryCtrl -= reductionAmount;

                // Update the total stock count
                totalStock -= reductionAmount;
            }
            foreach (var s in pricedItems)
            {
                if (s.Width > s.Length)
                {
                    var temp = s.Length;
                    s.Length = s.Width;
                    s.Width = temp;
                }
                if (cutPiece.Thickness > 0 && cutPiece.Thickness <= 0.010M)
                {
                    stackHeight = 1;
                }
                else if (cutPiece.Thickness >= 0.011M && cutPiece.Thickness <= 0.030M)
                {
                    int height = 1; //inch
                    stackHeight = (int)Math.Floor(height / (double)cutPiece.Thickness);
                    //up to 1 inch
                }
                else if (cutPiece.Thickness >= 0.031M && cutPiece.Thickness <= 2.000M)
                {
                    int height = 2; //inch
                    stackHeight = (int)Math.Floor(height / (double)cutPiece.Thickness);
                }
                else
                {
                    stackHeight = 1;
                }
                Stock st = new Stock
                {
                    Name = string.Format("{0}", s.SafeNo),
                    Length = s.Length,
                    Width = s.Width,
                    Thickness = s.Thickness,
                    Quantity = 0,
                    AutoAdd = true,
                    Type = "sheet",
                    Cost = (double)s.MinUsablePrice
                };
                stocks.Add(st);
            }
            Guid g = Guid.NewGuid();
            List<Part> parts = new List<Part>();
            Part p = new Part
            {
                Name = string.Format("{0}x{1}-{2} Parts", cutPiece.Length.ToString(), cutPiece.Width.ToString(), g),
                Length = Convert.ToDouble(cutPiece.Length),
                Width = Convert.ToDouble(cutPiece.Width),
                Thickness = Convert.ToDouble(cutPiece.Thickness),
                Quantity = cutPiece.Quantity,
                OrientationLock = false
            };
            parts.Add(p);

            if (cutPiece.Thickness >= 2)
            {
                stackHeight = 1;
            }
            else
            {
                stackHeight = (int)Math.Floor(maxHeight / (double)cutPiece.Thickness);
            }

            Calculation c = new Calculation();

            var cModel = new OptimizationRequest
            {
                Stocks = stocks,
                Parts = parts,
                Saw = new Saw
                {
                    BladeWidth = kerf,
                    CutType = "guillotine",
                    CutPreference = "w",
                    GuillotineOptions = new GuillotineOptions
                    {
                        Strategy = "efficiency"
                    },
                    StackHeight = stackHeight
                }
            };
            var cal = c.Calculate(cModel);
            Conversion conv = new Conversion();
            var response = conv.ConvertOptimizationResultToResponse(cal, cModel);
            return response;
            //new
        }
    }
}
