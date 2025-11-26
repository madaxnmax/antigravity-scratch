using System.ComponentModel.DataAnnotations;

namespace AtlasConfigurator.Workers.CutRod
{
    public class PricedItem
    {
        [Key]
        public int Id { get; set; }
        public string No { get; set; }
        public string SafeNo { get; set; }
        public string Grade { get; set; }
        public double Diameter { get; set; }
        public double Length { get; set; }
        public string Description { get; set; }
        public decimal StockPrice { get; set; }
        public decimal CustomerCardPrice { get; set; }
        public decimal SalesCodePrice { get; set; }
        public decimal MinUsablePrice { get; set; }
        public int QuantityUsed { get; set; }
        public decimal TotalAfterRebate { get; set; }
        public decimal Rebate { get; set; }
        public decimal InventoryCtrl { get; set; }
        public string Customer { get; set; }
        public string PriceGroup { get; set; }
        public decimal ToleranceMinusLength { get; set; }
        public decimal TolerancePlusLength { get; set; }
        public int DiscountPercentage { get; set; }
    }
}
