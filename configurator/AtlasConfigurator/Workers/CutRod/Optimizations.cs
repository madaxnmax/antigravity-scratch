using AtlasConfigurator.Hubs;
using AtlasConfigurator.Interface;
using AtlasConfigurator.Models.CutRod;
using AtlasConfigurator.Models.SmartCut;
using AtlasConfigurator.Services;
using Microsoft.AspNetCore.Components;

namespace AtlasConfigurator.Workers.CutRod
{
    public class Optimizations
    {
        private readonly IProportionValueService _proportionValueService;
        private readonly SmartCalculationService service;
        private readonly JobTaskManager _jobTaskManager;
        private readonly NavigationManager _navigationManager;
        public Optimizations(IProportionValueService proportionValueService, SmartCalculationService service, JobTaskManager jobTaskManager, NavigationManager navigationManager)
        {
            _proportionValueService = proportionValueService;
            this.service = service;
            _jobTaskManager = jobTaskManager;
            _navigationManager = navigationManager;
        }
        public List<List<object>> Data { get; set; }
        public async Task<SmartResponse> CutOptimization(CutPiece cutPiece, List<PricedItem> pricedItems, double Kerf, string connectionId)
        {
            //get all sheets that match material & thickness todo

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
                Stock st = new Stock
                {
                    name = string.Format("{0}", s.SafeNo),
                    l = s.Length,
                    w = s.Diameter,
                    t = s.Diameter,
                    //material = "rod",
                    q = 1,//(int)s.InventoryCtrl, //was 1 8/11/2023
                    autoAdd = true,
                    //grain = "l",
                    //trim = new Trim
                    //{
                    //    x1 = 0,
                    //    x2 = 0,
                    //    y1 = 0,
                    //    y2 = 0
                    //},
                    //allowExactFitShapes = true,
                    type = "sheet",
                    cost = (double)s.MinUsablePrice
                };
                stocks.Add(st);
            }
            Guid g = Guid.NewGuid();
            List<Part> parts = new List<Part>();
            Part p = new Part
            {
                name = string.Format("{0}x{1}-{2} Parts", cutPiece.Length.ToString(), cutPiece.Diameter.ToString(), g),
                l = cutPiece.Length,
                w = cutPiece.Diameter,
                t = cutPiece.Diameter,
                //material = "rod",
                q = cutPiece.Quantity,
                //banding = new Banding
                //{
                //    x1 = false,
                //    x2 = false,
                //    y1 = false,
                //    y2 = false
                //},
                //bandingType = new BandingType
                //{
                //    x1 = null,
                //    x2 = null,
                //    y1 = null,
                //    y2 = null
                //},
                orientationLock = null
            };
            parts.Add(p);
            double maxHeight = 2.5;

            int stackHeight = 0;
            if (cutPiece.Diameter >= 2)
            {
                stackHeight = 1;
            }
            else
            {
                stackHeight = (int)Math.Floor(maxHeight / (double)cutPiece.Diameter);
            }

            string prodHook = "https://configurator.atlasfibre.com/api/webhook";
            string devHook = "https://dev-configurator.atlasfibre.com/api/webhook";
            string localHook = "https://nationally-patient-sunfish.ngrok-free.app/api/webhook";
            string webhookUrl;
            if (GetBaseUrl().Contains("localhost") || GetBaseUrl().Contains("ngrok"))
            {
                webhookUrl = localHook;
            }
            else if (GetBaseUrl().Contains("dev-configurator.atlasfibre.com"))
            {
                webhookUrl = devHook;
            }
            else
            {
                webhookUrl = prodHook;
            }

            SmartCalculate cal = new SmartCalculate
            {
                saw = new Saw
                {
                    bladeWidth = Kerf,
                    cutType = "guillotine",
                    cutPreference = "flex",
                    guillotineOptions = new GuillotineOptions
                    {
                        strategy = "efficiency"
                    }
                    //efficiencyOptions = new EfficiencyOptions
                    //{
                    //    primaryCompression = "y"
                    //},
                    //stackHeight = Convert.ToDouble(stackHeight)
                },
                stock = stocks,
                parts = parts,
                webhook = webhookUrl
            };
            var jobId = await service.SendPart(cal, connectionId);
            if (string.IsNullOrEmpty(jobId))
            {
                throw new Exception("Failed to submit job to SmartCut. JobId is null or empty.");
            }
            // Register the job in JobTaskManager to wait for its completion
            var jobTask = _jobTaskManager.AddTask(jobId);
            SmartResponse result = await jobTask;
            return result;

        }
        public string GetBaseUrl()
        {
            return _navigationManager.BaseUri;
        }
        public async Task<List<RemnantRebate>> GetOffcutData(SmartResponse rs, List<PricedItem> pricedItems)
        {
            var remnantRebateList = new List<RemnantRebate>();

            var p = rs.Parts.FirstOrDefault();
            double totalSqInch = (p.W ?? 0) * (p.L ?? 0);

            if (rs.Offcuts != null)
            {
                foreach (var o in rs.Offcuts)
                {

                    double l = (o.L ?? 0);
                    double w = (o.W ?? 0);
                    var stockSheetOffId = o.Stock.Id;
                    var stockSheet = rs.Stock.Where(x => x.Id == stockSheetOffId).FirstOrDefault();

                    double sheet = (stockSheet.L ?? 0) * (stockSheet.W ?? 0);
                    double Remnant = FullValueRemnant((stockSheet.Cost ?? 0), w, l, sheet);
                    decimal ProportionPercentage = await ProportionValue(w, l);
                    double Rebate = (double)CustomerRebateValue(Remnant, ProportionPercentage);
                    var price = pricedItems.Where(x => x.SafeNo == stockSheet.Name).Select(x => x.MinUsablePrice).FirstOrDefault();
                    RemnantRebate r = new RemnantRebate
                    {
                        remnantLength = l,
                        remnantWidth = w,
                        RemnantValue = (decimal)Remnant,
                        ProportionPercentage = ProportionPercentage,
                        CustomerRebate = (decimal)Rebate,
                        SheetCost = (decimal)price,
                        No = stockSheet.Name,
                        Quantity = Convert.ToInt32(o.Q),
                        TotalOffcutValue = (decimal)(Convert.ToDouble(o.Q) * Rebate)
                    };
                    remnantRebateList.Add(r);

                    //decimal percentage = GetOffcutPercentage(l,w);
                }
            }
            return remnantRebateList;
        }

        public double FullValueRemnant(double sheetCost, double x, double y, double SheetSqFt)
        {

            double total = Math.Round(x * y / SheetSqFt * sheetCost, 2);
            return total;
        }

        public decimal CustomerRebateValue(double remnantCost, decimal percentage)
        {
            decimal total = Math.Round((percentage / 100) * (decimal)remnantCost, 2);
            return total;
        }

        public async Task<decimal> ProportionValue(double x, double y)
        {
            var propValues = await _proportionValueService.GetProportions();
            decimal percentage = JsonChart.GetPercentageValue((decimal)x, (decimal)y, propValues);

            return percentage;
        }
    }
}
