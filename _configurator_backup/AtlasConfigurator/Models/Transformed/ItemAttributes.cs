namespace AtlasConfigurator.Models.Transformed
{
    public class ItemAttributes
    {
        public string? ItemNumber { get; set; }
        public string? NEMAGrade { get; set; }
        public string? Thicknesses { get; set; }
        public string? Color { get; set; }
        public string? WidthIn { get; set; }
        public string? MILSpec { get; set; }
        public string? MILType { get; set; }
        public string? LengthIn { get; set; }
        public string? ThickPlus { get; set; }
        public string? ThickMinus { get; set; }
        public bool? Rolled { get; set; } = false;
        public decimal? NetWeight { get; set; }
        public decimal? GrossWeight { get; set; }

        public ItemAttributes(string itemNumber)
        {
            ItemNumber = itemNumber;
        }
    }
}
