using AtlasConfigurator.Models.Transformed;

namespace AtlasConfigurator.Workers.CutPieceSand
{
    public class Helpers
    {
        public bool IsMultipleOf6Or16(decimal value)
        {
            if (value == 0)
            {
                return false;
            }
            return value % 6 == 0 || value % 16 == 0;
        }
        public bool CheckFit(List<ItemAttributes> dimensions, decimal l, decimal w)
        {
            decimal lLarge = Math.Max(w, l);
            decimal wSmall = Math.Min(w, l);

            foreach (var dimension in dimensions)
            {

                decimal length = Math.Max(Convert.ToInt32(dimension.LengthIn), Convert.ToInt32(dimension.WidthIn));
                decimal width = Math.Max(Convert.ToInt32(dimension.LengthIn), Convert.ToInt32(dimension.WidthIn));

                if (lLarge <= length && wSmall <= width)
                {
                    // At least one value fits
                    return true;
                }
            }

            // No values fit
            return false;
        }

        public string Truncate(string value, int maxLength)
        {
            if (string.IsNullOrEmpty(value)) return value;
            return value.Length <= maxLength ? value : value.Substring(0, maxLength);
        }
    }
}
