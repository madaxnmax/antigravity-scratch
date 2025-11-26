namespace AtlasConfigurator.Models.CutAlgorithm
{
    public class OptimizationResult
    {
        public List<CuttingPlan> CuttingPlans { get; set; }
        public double TotalCost { get; set; }
        public List<Part> UnplacedParts { get; set; }
        public string PdfReport { get; set; } // Base64-encoded PDF
    }
}
