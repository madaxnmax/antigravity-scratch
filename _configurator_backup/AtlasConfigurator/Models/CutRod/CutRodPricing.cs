namespace AtlasConfigurator.Models.CutRod
{
    public class CutRodPricing
    {
        public decimal TotalCustomerCostPerPiece { get; set; }
        public decimal TotalCustomerCostTimesQuantity { get; set; }
        public decimal StockTotal { get; set; }
        public decimal RebateTotal { get; set; }
        public decimal CutCostTotal { get; set; }
        public decimal SandingTotal { get; set; }
        public int Quantity { get; set; }
        public string PDF { get; set; }
        public int DiscountPercentage { get; set; }
        public List<FinalUsedStock> StockUsed { get; set; } = new List<FinalUsedStock>();
    }
    public class FinalUsedStock
    {
        public string StockSku { get; set; }
        public double Length { get; set; }
        public double Width { get; set; }
        public int StockQty { get; set; }
        public string UOM { get; set; }
    }
}
