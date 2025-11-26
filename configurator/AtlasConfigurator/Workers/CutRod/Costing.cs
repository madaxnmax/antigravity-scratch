using AtlasConfigurator.Interface;
using AtlasConfigurator.Models.SmartCut;
using AtlasConfigurator.Services;

namespace AtlasConfigurator.Workers.CutRod
{
    public class Costing
    {
        private readonly Authentication _authentication;

        private readonly IMaterialkMultiplierService _mm;
        private readonly IThicknessMultiplierService _tm;
        private readonly IBandMultiplierService _bm;

        public Costing(IMaterialkMultiplierService mm, IThicknessMultiplierService tm, IBandMultiplierService bm, Authentication authentication)
        {
            _mm = mm;
            _tm = tm;
            _bm = bm;
            _authentication = authentication;
        }

        public async Task<decimal> CostPerCut(List<PricedItem> pricingitems, SmartResponse rs)
        {
            decimal cuttingCost = 0.00M;
            var pricingGroup = pricingitems.Select(x => x.PriceGroup).FirstOrDefault();
            var cuttingCostList = await _authentication.GetCuttingCost();

            //if (!string.IsNullOrEmpty(pricingGroup))
            //{
            //    var allCutCharges = cuttingCostList.value
            //    .Where(x => DateTime.Parse(x.Starting_Date) <= DateTime.Today && x.Sales_Code == pricingGroup && x.ItemNoFilterCtrl == "CUTCHARGE")
            //    .ToList();
            //    allCutCharges = allCutCharges.Where(x => DateTime.Parse(x.Ending_Date) == DateTime.Parse("0001-01-01") || DateTime.Parse(x.Ending_Date) > DateTime.Today).ToList();
            //    if (allCutCharges.Count > 0)
            //    {
            //        var item = allCutCharges.OrderBy(x => x.Unit_Price).FirstOrDefault();
            //        cuttingCost = (decimal)item.Unit_Price;
            //    }
            //    else
            //    {
            //        var standard = await _authentication.GetStandardCuttingCost();
            //        var standardItems = standard.value.FirstOrDefault();
            //        var cost = standardItems.Unit_Price;
            //        cuttingCost = (decimal)cost;
            //    }
            //}
            //else
            //{
            //    var standard = await _authentication.GetStandardCuttingCost();
            //    var standardItems = standard.value.FirstOrDefault();
            //    var cost = standardItems.Unit_Price;
            //    cuttingCost = (decimal)cost;
            //}


            List<decimal> perimeters = new List<decimal>();
            var rsSort1 = rs.Stock.Where(x => x.Used == true && x.Analysis != null).ToList();
            double cost = 0.00;
            foreach (var r1 in rsSort1) //list of unique stocks
            {

                if (r1.T < 0.5)
                {
                    cost = 0.50; // $0.50 per cut for thickness below 0.5 inches
                }
                else if (r1.T < 1.25)
                {
                    cost = 1.00; // $1.00 per cut for thickness below 1.25 inches
                }
                else if (r1.T < 2.5)
                {
                    cost = 1.50; // $1.50 per cut for thickness below 2.5 inches
                }
                else
                {
                    cost = 4.00; // $4.00 per cut for thickness of 2.5 inches or more
                }

                var formula = Math.Round((r1.Analysis.NumberOfCuts ?? 1) * (decimal)cost, 2);

                perimeters.Add(formula);
            }

            decimal totalcost = Math.Round(perimeters.Sum(), 2);
            if (totalcost < 30)
            {
                totalcost = 30;
            }

            return totalcost;
        }

        // Function to get the first digit before the decimal point
        private int GetFirstDigitBeforeDecimal(double number)
        {
            string numberString = number.ToString();
            int decimalIndex = numberString.IndexOf('.');

            if (decimalIndex == -1)
            {
                // No decimal point, return the whole number as it is
                return int.Parse(numberString);
            }
            else
            {
                // Extract the characters before the decimal point and convert to an integer
                return int.Parse(numberString.Substring(0, decimalIndex));
            }
        }

    }
}
