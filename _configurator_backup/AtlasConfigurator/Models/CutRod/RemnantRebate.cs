using System.ComponentModel.DataAnnotations;

namespace AtlasConfigurator.Models.CutRod
{
    public class RemnantRebate
    {
        [Key]
        public int Id { get; set; }
        public double remnantLength { get; set; }
        public double remnantWidth { get; set; }
        public decimal RemnantValue { get; set; }
        public decimal ProportionPercentage { get; set; }
        public decimal CustomerRebate { get; set; }
        public decimal SheetCost { get; set; }
        public string No { get; set; }
        public int Quantity { get; set; }
        public decimal TotalOffcutValue { get; set; }
    }
}
