namespace AtlasConfigurator.Helpers.CustomGrind
{
    public class CustomGrindHelper
    {
        public class GrindingCalculation
        {
            public decimal TotalLabor { get; set; }
            public decimal LaborCost { get; set; }
            public decimal SetupCost { get; set; }
            public decimal TotalSetupCharge { get; set; }
            public decimal TotalFeet { get; set; }
            public decimal StartingDiameter { get; set; }
            public decimal FinishDiameter { get; set; }
            public decimal LengthInches { get; set; }
            public decimal? DiameterPlus { get; set; } = 0;
            public int RodQuantity { get; set; }
            public decimal TotalGroundDiameter { get; set; }

            // Price and charge tables based on diameter
            private readonly Dictionary<decimal, decimal> pricePerPass = new Dictionary<decimal, decimal>
    {
        { 0.062m, 0.08m },
        { 0.157m, 0.10m },
        { 0.188m, 0.13m },
        { 0.251m, 0.15m },
        { 0.376m, 0.21m },
        { 0.876m, 0.28m },
        { 1.313m, 0.32m },
        { 2.001m, 0.38m },
        { 2.501m, 0.45m },
        { 3.501m, 0.60m }
    };

            private readonly Dictionary<decimal, decimal> setupCharge = new Dictionary<decimal, decimal>
    {
        { 0.062m, 75 },
        { 1.001m, 100 },
        { 2.001m, 125 },
        { 3.001m, 175 }
    };

            public GrindingCalculation(decimal startingDiameter, decimal finishDiameter, decimal lengthInches, int rodQuantity, decimal diameterPlus)
            {
                StartingDiameter = startingDiameter;
                FinishDiameter = finishDiameter;
                LengthInches = lengthInches;
                RodQuantity = rodQuantity;
                DiameterPlus = diameterPlus;
                TotalGroundDiameter = startingDiameter - finishDiameter;

                // Calculate total feet based on length and quantity
                TotalFeet = ((LengthInches / 12) * RodQuantity);

            }

            public decimal CalculateTotalLabor()
            {
                // Labor cost based on passes and price per pass
                decimal passes = CalculatePasses();
                decimal pricePerPassValue = GetPricePerPass();
                LaborCost = passes * pricePerPassValue;

                // Setup cost calculation
                //decimal setupChargeValue = GetSetupCharge();
                //TotalSetupCharge = setupChargeValue / TotalFeet;
                // LengthInInches is the amount actually being ground on each rod, not the full rod length
                // Setup charge — calculate   feet of rods being ground
                decimal totalFeetBeingGround = (LengthInches / 12.0m) * RodQuantity;
                decimal setupChargeValue = GetSetupCharge(); // Based on StartingDiameter
                TotalSetupCharge = setupChargeValue / totalFeetBeingGround;



                // Total labor calculation
                TotalLabor = (LaborCost + TotalSetupCharge) < 150 ? 150 : (LaborCost + TotalSetupCharge);

                return TotalLabor;
            }

            private decimal CalculatePasses()
            {
                // Formula for passes: ((Starting OD - Finish OD) / 0.025) + 1
                decimal adjustedFinish = FinishDiameter - DiameterPlus.Value; // more material to remove

                return ((StartingDiameter - adjustedFinish) / 0.025m) + 1;
            }

            //private decimal GetPricePerPass()
            //{
            //    // Get the price per pass based on the starting diameter
            //    foreach (var item in pricePerPass)
            //    {
            //        if (StartingDiameter >= item.Key)
            //            continue;

            //        return item.Value;
            //    }

            //    return pricePerPass.Last().Value; // Default price if no match
            //}
            private decimal GetPricePerPass()
            {

                if (pricePerPass.Count == 0)
                    throw new InvalidOperationException("pricePerPass is empty.");

                return pricePerPass
                    .Where(x => StartingDiameter >= x.Key)
                    .DefaultIfEmpty(pricePerPass.OrderBy(x => x.Key).First()) // fallback
                    .OrderByDescending(x => x.Key)
                    .First()
                    .Value;
            }

            private decimal GetSetupCharge()
            {
                return setupCharge
                    .Where(x => StartingDiameter >= x.Key)
                    .DefaultIfEmpty(setupCharge.OrderBy(x => x.Key).First()) // fallback
                    .OrderByDescending(x => x.Key)
                    .First().Value;
            }

            //private decimal GetSetupCharge()
            //{
            //    // Get the setup charge based on the starting diameter
            //    foreach (var item in setupCharge)
            //    {
            //        if (StartingDiameter >= item.Key)
            //            continue;

            //        return item.Value;
            //    }

            //    return setupCharge.Last().Value; // Default setup charge if no match
            //}
        }

    }
}
