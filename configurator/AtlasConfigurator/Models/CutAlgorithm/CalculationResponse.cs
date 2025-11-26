namespace AtlasConfigurator.Models.CutAlgorithm
{
    public class CuttingPlan
    {
        public Stock Stock { get; set; }
        public List<PartPlacement> PartsPlaced { get; set; }
        public List<Offcut> Offcuts { get; set; }
        public int Quantity { get; set; }       // Total sheets used for this plan
        public int StackHeight { get; set; }    // Number of sheets cut at once
        public int TotalSets { get; set; }      // Number of times this plan is set up
        public string Visualization { get; set; } // Base64-encoded image

        public string GetPlanKey()
        {
            // Create a unique key based on parts placement and stock size
            var placementsKey = string.Join(";", PartsPlaced.Select(p =>
                $"{p.Part.Name}:{p.X},{p.Y},{p.Rotation}"));

            var stockKey = $"{Stock.Length}x{Stock.Width}";

            return $"{stockKey}|{placementsKey}";
        }
    }



    public class PartPlacement
    {
        public Part Part { get; set; }
        public double X { get; set; }        // Position on the stock (along the X-axis)
        public double Y { get; set; }        // Position on the stock (along the Y-axis)
        public double Rotation { get; set; } // 0 or 90 degrees
    }

    public class Offcut
    {
        public double Width { get; set; }
        public double Length { get; set; }
        public int Quantity { get; set; }
    }
    public class MaximalRectangle
    {
        public double X { get; set; }
        public double Y { get; set; }
        public double Width { get; set; }
        public double Height { get; set; }
    }
}
