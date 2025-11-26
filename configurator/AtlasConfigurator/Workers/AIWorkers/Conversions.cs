using AtlasConfigurator.Models;
using AtlasConfigurator.Models.AI;

namespace AtlasConfigurator.Workers.AIWorkers
{
    public class Conversions
    {
        public List<SheetQuote> Sheets(AIProcessResponse aiResponse)
        {
            List<SheetQuote> sheets = new List<SheetQuote>();

            foreach (var s in aiResponse.sheet_value ?? new List<SheetValue>())
            {
                if (s == null) continue;

                SheetQuote sheet = new SheetQuote();
                sheet.Color = s.Color;
                sheet.Grade = s.Grade;
                int.TryParse(s.Length, out int length);
                sheet.LengthIn = length;
                int.TryParse(s.Width, out int width);
                sheet.WidthIn = width;
                sheet.Quantity = s.Quantity;
                sheet.Comments = s.TestingRequired;
                sheet.Size = $"{length}x{width}";
                sheet.ItemNo = "";
                decimal.TryParse(s.Thickness, out decimal thickness);
                sheet.Thickness = thickness;
                sheet.Customer = "";
                sheet.NumberofSandedSides = s.NumberofSandedSides;
                sheet.GrainDirection = s.GrainDirection;
                sheet.SandedThickness = s.Thickness;
                sheet.SandedThicknessTolerancePlus = s.ThicknessTolerancePlus;
                sheet.SandedThicknessToleranceMinus = s.SheetThicknessToleranceMinus;
                sheet.NumberofMaskedSides = s.NumberofMaskedsides;

                sheets.Add(sheet);
            }

            return sheets;
        }

        public CutPieceSandQuote CutSheets(SheetValue s)
        {
            CutPieceSandQuote sheet = new CutPieceSandQuote();

            sheet.Color = s.Color;
            sheet.Grade = s.Grade;
            decimal.TryParse(s.Length, out decimal length);
            sheet.Length = length;
            decimal.TryParse(s.Width, out decimal width);
            sheet.Width = width;
            sheet.Quantity = s.Quantity;
            sheet.ExtraComments = s.TestingRequired;
            sheet.Size = $"{length}x{width}";
            decimal.TryParse(s.Thickness, out decimal thickness);
            sheet.Thickness = thickness;
            int.TryParse(s.NumberofSandedSides, out int sides);
            sheet.SandedSides = sides;
            sheet.GrainDirection = s.GrainDirection;
            decimal.TryParse(s.ThicknessTolerancePlus, out decimal thickPlus);
            sheet.ThickPlus = thickPlus;
            decimal.TryParse(s.SheetThicknessToleranceMinus, out decimal thickMinus);
            sheet.ThickMinus = thickMinus;
            int.TryParse(s.NumberofMaskedsides, out int mask);
            sheet.MaskingSides = mask;

            return sheet;
        }

    }
}
