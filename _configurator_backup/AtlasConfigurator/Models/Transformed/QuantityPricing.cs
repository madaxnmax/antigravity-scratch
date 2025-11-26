namespace AtlasConfigurator.Models.Transformed
{
    public class QuantityPricing
    {
        public int Quantity { get; set; }
        public decimal PricePerItem { get; set; }
        public decimal TotalPrice
        {
            get
            {
                decimal basePrice = Quantity * PricePerItem;
                decimal totalWithExtras = basePrice + MaskingTotal + SandingTotal;

                return totalWithExtras;
            }
        }

        public int DiscountPercentage { get; set; }
        // New properties
        public decimal MaskingTotal { get; set; } = 0;
        public decimal SandingTotal { get; set; } = 0;
        public QuantityPricing(int quantity, decimal pricePerItem)
        {
            Quantity = quantity;
            PricePerItem = pricePerItem;
        }
        public int PanelsUsed { get; set; } = 0;
    }
}
