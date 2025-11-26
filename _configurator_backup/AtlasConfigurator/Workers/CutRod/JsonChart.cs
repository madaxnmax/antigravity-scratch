using AtlasConfigurator.Models.Database;

namespace AtlasConfigurator.Workers.CutRod
{
    public class JsonChart
    {
        public static decimal GetPercentageValue(decimal targetX, decimal targetY, List<ProportionValue> proportions)
        {
            if (proportions == null || !proportions.Any())
            {
                Console.WriteLine("No proportions data available.");
                return 0;
            }
            // Assuming Length corresponds to X and Width corresponds to Y
            var xValues = proportions.Select(p => (decimal)p.Length).Distinct();
            var yValues = proportions.Select(p => (decimal)p.Width).Distinct();

            // Find the closest X value
            decimal closestX = xValues.OrderBy(x => Math.Abs(x - targetX)).First();

            // Find the closest Y value
            decimal closestY = yValues.OrderBy(y => Math.Abs(y - targetY)).First();

            var matchingProportion = proportions.FirstOrDefault(p => p.Length == closestX && p.Width == closestY);
            if (matchingProportion == null)
            {
                Console.WriteLine("No matching proportion found.");
                return 0;
            }
            if (decimal.TryParse(matchingProportion.Percentage.TrimEnd('%'), out decimal percentage))
            {
                Console.WriteLine($"Closest values: X = {closestX}, Y = {closestY}");
                Console.WriteLine($"Percentage value for X = {closestX} and Y = {closestY}: {percentage}%");
                return percentage;
            }
            else
            {
                Console.WriteLine("Failed to parse the percentage value.");
                return 0;
            }
        }
    }
}
