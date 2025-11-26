namespace AtlasConfigurator.Models.CutPieceSand
{
    public class FullStockListing
    {
        public List<DataItem> Data { get; set; }
    }

    public class DataItem
    {
        public string No { get; set; }
        public string Grade { get; set; }
        public string Size { get; set; }
        public double Thickness { get; set; }
        public string Color { get; set; }
        public double Kerf { get; set; }
        public double Length { get; set; }
        public double Width { get; set; }
    }

    public class StockUsedForQuote
    {
        public Guid Id { get; set; }
        public string StockSku { get; set; }
        public int StockQtyUsed { get; set; }
        public int StockNorthbrook { get; set; }
        public int StockAll { get; set; }
        public int IdealYield { get; set; }
    }
}
