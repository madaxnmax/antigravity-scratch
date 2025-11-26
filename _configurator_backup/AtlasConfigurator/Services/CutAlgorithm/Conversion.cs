using AtlasConfigurator.Models.CutAlgorithm;
using AtlasConfigurator.Models.SmartCut;
using Saw = AtlasConfigurator.Models.CutAlgorithm.Saw;

namespace AtlasConfigurator.Services.CutAlgorithm
{
    public class Conversion
    {
        public SmartResponse ConvertOptimizationResultToResponse(OptimizationResult optimizationResult, OptimizationRequest request)
        {
            var response = new SmartResponse();

            // Map Saw
            response.Saw = MapSaw(request.Saw);

            // Map Stock
            response.Stock = MapStocks(optimizationResult.CuttingPlans);

            // Map Parts
            response.Parts = MapParts(optimizationResult.CuttingPlans);

            // Map Cuts
            response.Cuts = MapCuts(optimizationResult.CuttingPlans);

            // Map Offcuts
            response.Offcuts = MapOffcuts(optimizationResult.CuttingPlans);

            // Map Metadata
            response.Metadata = MapMetadata(optimizationResult);

            // Map PDF File
            response.File = optimizationResult.PdfReport;

            return response;
        }
        private ResponseSaw MapSaw(Saw saw)
        {
            return new ResponseSaw
            {
                BladeWidth = saw.BladeWidth,
                CutType = saw.CutType,
                CutPreference = saw.CutPreference,
                GuillotineOptions = new ResponseGuillotineOptions
                {
                    Strategy = saw.GuillotineOptions?.Strategy
                },
                StackHeight = saw.StackHeight,
                StockType = "sheet", // Assuming sheet, adjust as needed
                Options = null // Set if you have additional options
            };
        }
        private List<ResponseStock> MapStocks(List<CuttingPlan> cuttingPlans)
        {
            var responseStocks = new List<ResponseStock>();
            foreach (var plan in cuttingPlans)
            {
                var stock = plan.Stock;
                responseStocks.Add(new ResponseStock
                {
                    Id = "1",//Guid.NewGuid().ToString(), // Generate an ID if needed
                    Name = stock.Name,
                    Duplicate = false, // Adjust based on your logic
                    Used = true,
                    L = stock.Length,
                    W = stock.Width,
                    T = stock.Thickness,
                    Material = null, // Set if you have material info
                    Grain = null, // Set if you have grain info
                    Trim = null, // Set if applicable
                    Type = stock.Type,
                    Cost = stock.Cost,
                    Stack = plan.StackHeight,
                    Analysis = new ResponseAnalysis
                    {
                        // Calculate analysis data if needed
                    },
                    Issues = new List<string>(),
                    Notes = null
                });
            }
            return responseStocks;
        }
        private List<ResponsePart> MapParts(List<CuttingPlan> cuttingPlans)
        {
            var responseParts = new List<ResponsePart>();
            foreach (var plan in cuttingPlans)
            {
                foreach (var placement in plan.PartsPlaced)
                {
                    responseParts.Add(new ResponsePart
                    {
                        Id = "1",// Guid.NewGuid().ToString(), // Generate an ID if needed
                        Name = placement.Part.Name,
                        Duplicate = false,
                        Added = true,
                        X = placement.X,
                        Y = placement.Y,
                        L = placement.Part.Length,
                        W = placement.Part.Width,
                        T = placement.Part.Thickness,
                        Material = null, // Set if you have material info
                        Rot = placement.Rotation != 0,
                        Banding = null, // Set if applicable
                        BandingType = null, // Set if applicable
                        Stock = null, // Reference to the stock object
                        Issues = new List<string>(),
                        Notes = null
                    });
                }
            }
            return responseParts;
        }

        private List<ResponseCut> MapCuts(List<CuttingPlan> cuttingPlans)
        {
            var responseCuts = new List<ResponseCut>();

            // Implement logic to derive cuts from the placements
            // This may involve analyzing the positions of parts and calculating the cuts needed

            return responseCuts;
        }
        private List<ResponseOffcut> MapOffcuts(List<CuttingPlan> cuttingPlans)
        {
            var responseOffcuts = new List<ResponseOffcut>();
            foreach (var plan in cuttingPlans)
            {
                foreach (var offcut in plan.Offcuts)
                {
                    responseOffcuts.Add(new ResponseOffcut
                    {
                        X = null, // Set if applicable
                        Y = null, // Set if applicable
                        L = offcut.Length,
                        W = offcut.Width,
                        T = plan.Stock.Thickness,
                        Q = offcut.Quantity,
                        Material = null, // Set if you have material info
                        Stock = null, // Reference to the stock object
                        Grain = null, // Set if applicable
                        Type = plan.Stock.Type
                    });
                }
            }
            return responseOffcuts;
        }

        private ResponseMetadata MapMetadata(OptimizationResult optimizationResult)
        {
            return new ResponseMetadata
            {
                TotalStockCost = optimizationResult.TotalCost,
                UnusedStock = new List<ResponseUnusedStock>(), // Implement logic if needed
                UnplacedParts = optimizationResult.UnplacedParts.Select(p => new ResponseUnplacedPart
                {
                    Count = p.Quantity,
                    ParentID = null, // Set if applicable
                    Name = p.Name,
                    L = p.Length,
                    W = p.Width
                }).ToList(),
                UsedStockTally = null, // Implement logic if needed
                TotalCutLength = null, // Calculate if needed
                TotalBandingLength = null, // Calculate if needed
                BandingLengthByType = null, // Set if applicable
                TotalEfficiency = null, // Calculate if needed
                TotalPartArea = null // Calculate if needed
            };
        }


    }
}
