using AtlasConfigurator.Interface;
using AtlasConfigurator.Models.CutPieceSand;
using AtlasConfigurator.Models.SmartCut;
using AtlasConfigurator.Services;

namespace AtlasConfigurator.Workers.CutPieceSand
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

            var toleranceMinusLength = pricingitems.Select(x => x.ToleranceMinusLength).FirstOrDefault();
            var tolerancePlusLength = pricingitems.Select(x => x.TolerancePlusLength).FirstOrDefault();
            var toleranceMinusWidth = pricingitems.Select(x => x.ToleranceMinusWidth).FirstOrDefault();
            var tolerancePlusWidth = pricingitems.Select(x => x.TolerancePlusWidth).FirstOrDefault();
            try
            {
                if (!string.IsNullOrEmpty(pricingGroup))
                {
                    try
                    {
                        if (cuttingCostList != null)
                        {
                            var allCutCharges = cuttingCostList.value
                            .Where(x => DateTime.Parse(x.Starting_Date) <= DateTime.Today && x.Sales_Code == pricingGroup && x.ItemNoFilterCtrl == "CUTCHARGE")
                            .ToList();
                            allCutCharges = allCutCharges.Where(x => DateTime.Parse(x.Ending_Date) == DateTime.Parse("0001-01-01") || DateTime.Parse(x.Ending_Date) > DateTime.Today).ToList();

                            if (allCutCharges.Count > 0)
                            {
                                var item = allCutCharges.OrderBy(x => x.Unit_Price).FirstOrDefault();
                                cuttingCost = (decimal)item.Unit_Price;
                            }
                            else
                            {
                                var standard = await _authentication.GetStandardCuttingCost();
                                var standardItems = standard.value.FirstOrDefault();
                                var cost = standardItems.Unit_Price;
                                cuttingCost = (decimal)cost;
                            }
                        }
                        else
                        {
                            cuttingCost = 0.01M;
                        }
                    }
                    catch (Exception ex)
                    {
                        var standard = await _authentication.GetStandardCuttingCost();
                        var standardItems = standard.value.FirstOrDefault();
                        var cost = standardItems.Unit_Price;
                        cuttingCost = (decimal)cost;
                    }
                }
                else
                {
                    var standard = await _authentication.GetStandardCuttingCost();
                    var standardItems = standard.value.FirstOrDefault();
                    var cost = standardItems.Unit_Price;
                    cuttingCost = (decimal)cost;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error getting cutting cost");
            }
            decimal minToleranceLength = toleranceMinusLength;
            decimal maxToleranceLength = tolerancePlusLength;
            decimal BandSizeLength = minToleranceLength + maxToleranceLength;

            decimal minToleranceWidth = toleranceMinusWidth;
            decimal maxToleranceWidth = tolerancePlusWidth;
            decimal BandSizeWidth = minToleranceWidth + maxToleranceWidth;

            var mMulti = await _mm.GetMaterialMultiplier();
            var tMulti = await _tm.GetThicknessMultiplier();
            var bMulti = await _bm.GetBandMultiplier();

            List<ResponsePart> rsp = new List<ResponsePart>();
            foreach (var r in rs.Parts)
            {
                int g = (int)Math.Floor(Convert.ToDouble(r.Stock.Id));
            }

            List<decimal> perimeters = new List<decimal>();
            var rsSort1 = rs.Stock.Where(x => x.Used == true && x.Analysis != null).ToList();


            foreach (var r1 in rsSort1) //list of unique stocks
            {
                double sl = r1.L.Value * 2;
                double sw = r1.W.Value * 2;
                double totalSheetPerm = sl + sw;
                double pl = 0;
                double pw = 0;
                double ol = 0;
                double ow = 0;
                double totalPartPerm = 0;
                double totalOffcutPerm = 0;
                double totalPartAndOff = 0;
                double totalPaidPerm = 0;
                double totalPartOffStack = 0;
                bool isStackable = true;
                int stackCount = 1;
                bool noStack = true;
                try
                {
                    // Determine stackability and stack count
                    if (r1.Stack is bool boolValue)
                    {
                        isStackable = boolValue;
                        if (!boolValue) stackCount = 1;
                    }
                    else if (r1.Stack is string stringValue && bool.TryParse(stringValue, out bool parsedValue))
                    {
                        isStackable = parsedValue;
                        if (!parsedValue) stackCount = 1;
                    }
                    else if (!isStackable)
                    {
                        stackCount = 1;
                    }
                    else
                    {
                        stackCount = Convert.ToInt32(r1.Stack); // Handle possible conversion errors or defaults
                    }
                }
                catch (Exception ex)
                {

                    stackCount = 1;
                }



                foreach (var part in rs.Parts
                                   .Where(x => GetFirstDigitBeforeDecimal(Convert.ToDouble(x.Stock.Id)) == GetFirstDigitBeforeDecimal(Convert.ToDouble(r1.Id)))
                                   .ToList()) //get parts for that stock 
                {
                    pl = pl + part.L.Value;
                    pw = pw + part.W.Value;
                }

                if (rs.Offcuts != null)
                {
                    foreach (var offcut in rs.Offcuts
                        .Where(x => GetFirstDigitBeforeDecimal(Convert.ToDouble(x.Stock.Id)) == GetFirstDigitBeforeDecimal(Convert.ToDouble(r1.Id)))
                        .ToList()) //get offcuts for that stock 
                    {
                        ol = ol + offcut.L.Value;
                        ow = ow + offcut.W.Value;
                    }
                }


                totalPartPerm = (pl + pw) * 2;
                totalOffcutPerm = (ol + ow) * 2;
                totalPartAndOff = totalPartPerm + totalOffcutPerm;
                try
                {
                    if (r1.Stack is bool boolValuetwo)
                    {
                        isStackable = boolValuetwo;
                        if (!boolValuetwo) stackCount = 1; noStack = false;
                    }

                    else if (r1.Stack is string stringValue && bool.TryParse(stringValue, out bool parsedValue))
                    {
                        isStackable = parsedValue;
                        if (!parsedValue) stackCount = 1; noStack = false;
                    }
                    if (!noStack)
                    {
                        totalPartOffStack = totalPartAndOff;
                        stackCount = 1;
                        noStack = false;
                    }
                    else
                    {
                        stackCount = Convert.ToInt32(r1.Stack); // Handle possible conversion errors or defaults
                        totalPartOffStack = totalPartAndOff / Convert.ToDouble(r1.Stack);
                    }
                }
                catch (Exception ex)
                {

                    stackCount = 1;
                }
                totalPaidPerm = totalPartOffStack - totalSheetPerm;
                double PerimeterMultiplier = Math.Abs(totalPaidPerm);

                double thick = 0;


                if (!noStack)
                {
                    thick = (r1.T ?? 0);
                }
                else
                {

                    thick = (r1.T ?? 0) * Convert.ToDouble(r1.Stack);
                }

                var tRange = tMulti.Find(range => thick >= Convert.ToDouble(range.ThicknessMin) && thick <= Convert.ToDouble(range.ThicknessMax));

                if (tRange == null)
                {
                    // Select the highest value if ThicknessXStack is greater than the highest value in tList
                    tRange = tMulti.FindLast(range => thick > Convert.ToDouble(range.ThicknessMax));
                }
                double thicknessMultiplier = Convert.ToDouble(tRange.ThicknessMultiplierValue);

                var grade = pricingitems.Select(x => x.Grade).FirstOrDefault();
                var m = mMulti.Where(x => x.Grade == grade).FirstOrDefault();
                double materialMultiplier;
                //double materialMultiplier = Convert.ToDouble(m.MaterialMultiplierValue);
                if (m == null || m.MaterialMultiplierValue == 0)
                {
                    materialMultiplier = 1;
                }
                else
                {
                    materialMultiplier = Convert.ToDouble(m.MaterialMultiplierValue);
                }

                var filteredListLength = bMulti
                    .OrderBy(bs => Math.Abs(bs.BandSize - Convert.ToDecimal(BandSizeLength)))
                    .First();
                var bLength = filteredListLength.ToleranceMultiplier;

                var filteredListWidth = bMulti
                    .OrderBy(bs => Math.Abs(bs.BandSize - Convert.ToDecimal(BandSizeWidth)))
                    .First();
                var bWidth = filteredListWidth.ToleranceMultiplier;

                double toleranceValue = Math.Max(Convert.ToDouble(bLength), Convert.ToDouble(bWidth));

                double toleranceMultiplier = toleranceValue;
                decimal cuttingCharge = cuttingCost;


                //Primary cut formula
                var formula = Math.Round(((decimal)PerimeterMultiplier * (decimal)thicknessMultiplier * (decimal)materialMultiplier * (decimal)toleranceMultiplier * (decimal)cuttingCharge), 2);

                perimeters.Add(formula);

            }

            decimal totalcost = Math.Round(perimeters.Sum(), 2);


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
