using System.ComponentModel.DataAnnotations;

namespace AtlasConfigurator.Models.CutRod
{
    public class CutPiece
    {
        [Key]
        public int Id { get; set; }
        public decimal Length { get; set; }
        public int Quantity { get; set; }
        public decimal Diameter { get; set; }
        public decimal ToleranceMinusLength { get; set; }
        public decimal TolerancePlusLength { get; set; }
        public string Grade { get; set; }
        public decimal? DiameterPlus { get; set; }
        public decimal? DiameterMinus { get; set; }
    }
    public class CuttingOptimizationResult
    {
        public int NumberOfCuts { get; set; }
        public int NumberOfStocksUsed { get; set; }
        public decimal TotalLengthUsed { get; set; }
        public int StackHeight { get; set; }
        public int PiecesPerRod { get; set; } // Added PiecesPerRod
        public bool IsWithinTolerance { get; set; } // Indicates if cuts meet tolerance requirements
    }
}
