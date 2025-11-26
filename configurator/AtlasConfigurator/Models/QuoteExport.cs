using AtlasConfigurator.Models.CutPieceSand;
using AtlasConfigurator.Models.CutRod;
using AtlasConfigurator.Models.Transformed;

namespace AtlasConfigurator.Models
{
    public class QuoteExport
    {
        public DateTime DateCreated { get; set; }
        public string CustomerNumber { get; set; }
        public Guid Id { get; set; } = Guid.NewGuid();
        public string UserEmail { get; set; }

        public List<SheetQuote> SheetQuote { get; set; } = new List<SheetQuote>();
        public List<RodQuote> RodQuote { get; set; } = new List<RodQuote>();
        public List<TubeQuote> TubeQuote { get; set; } = new List<TubeQuote>();
        public List<CutTubeQuote> CutTubeQuote { get; set; } = new List<CutTubeQuote>();
        public List<CutRodQuote> CutRodQuote { get; set; } = new List<CutRodQuote>();
        public List<CustomGrindQuote> CustomGrindQuote { get; set; } = new List<CustomGrindQuote>();
        public List<CutPieceSandQuote> CutPieceSandQuote { get; set; } = new List<CutPieceSandQuote>();
        public List<WasherQuote> WasherQuote { get; set; } = new List<WasherQuote>();

    }
    public class SheetQuote
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string OverrideSku { get; set; }
        public string Grade { get; set; }
        public decimal Thickness { get; set; }
        public string Color { get; set; }
        public string Quantity { get; set; }
        public string Comments { get; set; }
        public string Size { get; set; }
        public string ItemNo { get; set; }
        public int WidthIn { get; set; }
        public int LengthIn { get; set; }
        public string Customer { get; set; }
        public List<QuantityPricing> Pricing { get; set; } = new List<QuantityPricing>();
        public string NumberofSandedSides { get; set; }
        public string GrainDirection { get; set; }
        public string SandedThickness { get; set; }
        public string SandedThicknessTolerancePlus { get; set; }
        public string SandedThicknessToleranceMinus { get; set; }
        public string NumberofMaskedSides { get; set; }
        public bool CustomMaterialOnly { get; set; } = false;

    }
    public class RodQuote
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string ItemNo { get; set; }
        public string OverrideSku { get; set; }
        public string GradeDropdown { get; set; }
        public decimal DiameterDropdown { get; set; }
        public string Quantity { get; set; }
        public string Comments { get; set; }
        public string Customer { get; set; }
        public string Color { get; set; }
        public bool Rolled { get; set; } = false;
        public List<QuantityPricing> Pricing { get; set; } = new List<QuantityPricing>();
        public string UOM { get; set; } = "EA";
    }
    public class TubeQuote
    {
        public Guid TubeID { get; set; } = Guid.NewGuid();
        public string Customer { get; set; }

        public string Grade { get; set; }
        public string Color { get; set; }
        public string Length { get; set; }
        public string LengthPlus { get; set; }
        public string LengthMinus { get; set; }
        public string ID { get; set; }
        public string IDPlus { get; set; }
        public string IDMinus { get; set; }
        public string OD { get; set; }
        public string ODPlus { get; set; }
        public string ODMinus { get; set; }
        public string UOM { get; set; }
        public string Comments { get; set; }
        public string Quantity { get; set; }
        public decimal PriceUOM { get; set; }
        public string TubeType { get; set; }
    }
    public class CutTubeQuote
    {
        public string GradeDropdown { get; set; }
        public string DiameterDropdown { get; set; }
        public string Length { get; set; }
        public string LengthPlus { get; set; }
        public string LengthMinus { get; set; }
        public string ID { get; set; }
        public string IDPlus { get; set; }
        public string IDMinus { get; set; }
        public string OD { get; set; }
        public string ODPlus { get; set; }
        public string ODMinus { get; set; }
        public string IDChamferAngle { get; set; }
        public string IDChamferAnglePlus { get; set; }
        public string IDChamferAngleMinus { get; set; }
        public string IDChamferDistance { get; set; }
        public string IDChamferDistancePlus { get; set; }
        public string IDChamferDistanceMinus { get; set; }
        public string ODChamferAngle { get; set; }
        public string ODChamferAnglePlus { get; set; }
        public string ODChamferAngleMinus { get; set; }
        public string ODChamferDistance { get; set; }
        public string ODChamferDistancePlus { get; set; }
        public string ODChamferDistanceMinus { get; set; }
    }
    public class CutRodQuote
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string ItemNo { get; set; }
        public string OverrideSku { get; set; }
        public string GradeDropdown { get; set; }
        public decimal DiameterDropdown { get; set; }
        public decimal Length { get; set; }
        public decimal LengthPlus { get; set; }
        public decimal LengthMinus { get; set; }
        public string Quantity { get; set; }
        public string Comments { get; set; }
        public string Customer { get; set; }
        public decimal Kerf { get; set; }
        public string Color { get; set; }
        public bool Rolled { get; set; } = false;

        public List<CutRodPricing> Pricing { get; set; } = new List<CutRodPricing>();
    }
    public class CustomGrindQuote
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string ItemNo { get; set; }
        public string Customer { get; set; }
        public string GradeDropdown { get; set; }
        public string OverrideSku { get; set; }
        public decimal DiameterDropdown { get; set; }
        public string Color { get; set; }
        public string Quantity { get; set; }
        public decimal Length { get; set; }
        public decimal LengthPlus { get; set; }
        public decimal LengthMinus { get; set; }
        public decimal Kerf { get; set; }
        public bool Rolled { get; set; }
        public decimal GroundDiameter { get; set; }
        public decimal GroundDiameterPlus { get; set; }
        public decimal GroundDiameterMinus { get; set; }
        public string Comments { get; set; }
        public string UOM { get; set; }
        public bool CustomerMaterialOnly { get; set; } = false;
        public bool CustomMaterialOnly { get; set; } = false;
        public List<GrindPricing> Pricing { get; set; } = new List<GrindPricing>();
        public decimal CustomRodFullLength { get; set; } = 0;
    }
    public class GrindPricing
    {
        public decimal LaborCost { get; set; }
        public decimal StockPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal PricePerItem { get; set; }
        public int Quantity { get; set; }
        public decimal TotalStockPrice { get; set; }
        public int TotalRodsRequired { get; set; }
        public int IdealYield { get; set; }
    }
    public class CutPieceSandQuote
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string ParentSKU { get; set; }
        public string Grade { get; set; }
        public decimal Thickness { get; set; }
        public string GrainDirection { get; set; }
        public decimal Length { get; set; }
        public decimal LengthPlus { get; set; }
        public decimal LengthMinus { get; set; }
        public decimal Width { get; set; }
        public decimal WidthPlus { get; set; }
        public decimal WidthMinus { get; set; }
        public decimal SandedThickness { get; set; }
        public decimal ThickPlus { get; set; }
        public decimal ThickMinus { get; set; }
        public int SandedSides { get; set; }
        public string ExtraComments { get; set; }
        public string SizeDropdown { get; set; }
        public string ThicknessDropdown { get; set; }
        public string GradeDropdown { get; set; }
        public string Size { get; set; }
        public string Color { get; set; }
        public decimal Kerf { get; set; }
        public string Quantity { get; set; }
        public bool SandingOnly { get; set; } = false;
        public bool CustomerMaterialOnly { get; set; } = false;
        public bool CustomMaterialOnly { get; set; } = false;
        public bool MaskingOnly { get; set; } = false;
        public int MaskingSides { get; set; } = 0;
        public bool GlossSandRemovalOnly { get; set; } = false;
        public List<CutPieceSandPricing> CutPieceSandQuantityPricing { get; set; } = new List<CutPieceSandPricing>();
    }
    public class WasherQuote
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Grade { get; set; }
        public string Color { get; set; }
        public string Size { get; set; }
        public string Quantity { get; set; }
        public string ItemNo { get; set; }
        public double Thickness { get; set; }

        public double ID { get; set; }
        public double IDPlus { get; set; }
        public double IDMinus { get; set; }
        public double OD { get; set; }
        public double ODPlus { get; set; }
        public double ODMinus { get; set; }
        public string SandedThickness { get; set; }
        public string ThickPlus { get; set; }
        public string ThickMinus { get; set; }
        public string SandedSides { get; set; }
        public string Comments { get; set; }
        public List<WasherQuantityPricing> Pricing { get; set; } = new List<WasherQuantityPricing>();

        public string SheetSize { get; set; } // e.g., "36x48", "48x48", etc.

        public int QuantityRequested { get; set; } // parsed quantity from Quantity field
        public string PanelSize { get; set; } // e.g., "48x96", "48x120", etc.
        public string MachineType { get; set; }


    }

    public class WasherQuantityPricing
    {
        public int Quantity { get; set; }
        public decimal PricePerItem { get; set; }
        public decimal TotalPrice
        {
            get
            {
                decimal basePrice = Quantity * PricePerItem;
                // decimal totalWithExtras = basePrice + MaskingTotal + SandingTotal;

                return basePrice;
            }
        }

        public int DiscountPercentage { get; set; }
        // New properties
        public decimal MaskingTotal { get; set; } = 0;
        public decimal SandingTotal { get; set; } = 0;
        public WasherQuantityPricing(int quantity, decimal pricePerItem)
        {
            Quantity = quantity;
            PricePerItem = pricePerItem;
        }
        public int PanelsUsed { get; set; } = 0;
        public decimal SheetCost { get; set; }
        public double PanelYield { get; set; }
        public int TotalSheets { get; set; }
        public int TotalPanels { get; set; }
        public decimal MachineCost { get; set; }
        public decimal MaterialCost { get; set; }
        public string PanelSize { get; set; }
        public int PanelWidth { get; set; }
        public int PanelLength { get; set; }
        public decimal CutCharge { get; set; }
        public decimal Margin { get; set; }
        public int PanelsPerFullSheet { get; set; }
    }
}
