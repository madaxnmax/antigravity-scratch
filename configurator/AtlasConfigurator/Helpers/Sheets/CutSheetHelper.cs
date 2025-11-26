using AtlasConfigurator.Models.Transformed;

namespace AtlasConfigurator.Helpers.Sheets
{
    public class CutSheetHelper
    {
        public (List<ItemAttributes> Stocks, bool FallBackStocks) FindNearestStocks(
    decimal requestedSandedThickness,
    List<ItemAttributes> itemAttributes,
    string grade,
    string color,
    bool potentialSanding,
    decimal? width = null,
    decimal? length = null)
        {
            if (potentialSanding)
            {
                // Filter items with potential sanding
                var potentialStocks = itemAttributes
                    .Where(x => x.NEMAGrade.Equals(grade, StringComparison.OrdinalIgnoreCase) &&
                                x.Color.Equals(color, StringComparison.OrdinalIgnoreCase) &&
                                (!width.HasValue || (decimal.TryParse(x.WidthIn, out var stockWidth) && stockWidth >= width.Value)) &&
                                (!length.HasValue || (decimal.TryParse(x.LengthIn, out var stockLength) && stockLength >= length.Value)))
                    .Select(x => new
                    {
                        Item = x,
                        EffectiveThickness = decimal.TryParse(x.Thicknesses, out var thickness) &&
                                             decimal.TryParse(x.ThickMinus, out var thickMinus)
                                             ? thickness - thickMinus
                                             : (decimal?)null
                    })
                    .Where(x => x.EffectiveThickness.HasValue && x.EffectiveThickness.Value >= requestedSandedThickness)
                    .ToList();

                // Exact matches for width and length
                var exactMatches = potentialStocks
                    .Where(x => (!width.HasValue || (decimal.TryParse(x.Item.WidthIn, out var stockWidth) && stockWidth == width.Value)) &&
                                (!length.HasValue || (decimal.TryParse(x.Item.LengthIn, out var stockLength) && stockLength == length.Value)))
                    .Select(x => x.Item)
                    .ToList();

                if (exactMatches.Any())
                {
                    return (exactMatches, false);
                }

                // Fall back to larger stocks
                var largerStocks = potentialStocks
                    .Select(x => x.Item)
                    .ToList();

                return (largerStocks, false);
            }
            else
            {
                // Filter items with exact or greater-than match on thickness
                var exactOrGreaterThicknessStocks = itemAttributes
                    .Where(x => x.NEMAGrade.Equals(grade, StringComparison.OrdinalIgnoreCase) &&
                                x.Color.Equals(color, StringComparison.OrdinalIgnoreCase) &&
                                (!width.HasValue || (decimal.TryParse(x.WidthIn, out var stockWidth) && stockWidth >= width.Value)) &&
                                (!length.HasValue || (decimal.TryParse(x.LengthIn, out var stockLength) && stockLength >= length.Value)))
                    .Select(x => new
                    {
                        Item = x,
                        EffectiveThickness = decimal.TryParse(x.Thicknesses, out var thicknessVal)
                                             ? (decimal?)thicknessVal
                                             : (decimal?)null
                    })
                    .Where(x => x.EffectiveThickness.HasValue)
                    .ToList();

                // Filter exact thickness matches
                var exactThicknessStocks = exactOrGreaterThicknessStocks
                    .Where(x => x.EffectiveThickness.Value == requestedSandedThickness)
                    .ToList();

                // Exact matches for width and length
                var exactMatches = exactThicknessStocks
                    .Where(x => (!width.HasValue || (decimal.TryParse(x.Item.WidthIn, out var stockWidth) && stockWidth == width.Value)) &&
                                (!length.HasValue || (decimal.TryParse(x.Item.LengthIn, out var stockLength) && stockLength == length.Value)))
                    .Select(x => x.Item)
                    .ToList();

                if (exactMatches.Any())
                {
                    return (exactMatches, false);
                }

                // Fall back to larger thickness stocks if no exact thickness matches
                var greaterThicknessStocks = exactOrGreaterThicknessStocks
                    .Where(x => x.EffectiveThickness.Value > requestedSandedThickness)
                    .OrderBy(x => x.EffectiveThickness.Value) // Sort by thickness ascending
                    .ToList();

                if (greaterThicknessStocks.Any())
                {
                    // Exact matches for width and length with greater thickness
                    var greaterThicknessExactMatches = greaterThicknessStocks
                        .Where(x => (!width.HasValue || (decimal.TryParse(x.Item.WidthIn, out var stockWidth) && stockWidth == width.Value)) &&
                                    (!length.HasValue || (decimal.TryParse(x.Item.LengthIn, out var stockLength) && stockLength == length.Value)))
                        .Select(x => x.Item)
                        .ToList();

                    if (greaterThicknessExactMatches.Any())
                    {
                        return (greaterThicknessExactMatches, false);
                    }

                    // Fall back to the first larger stock
                    return (greaterThicknessStocks
                        .Take(1) // Get the first stock
                        .Select(x => x.Item)
                        .ToList(), true);
                }
                return (exactMatches, false);


            }
        }


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

        public int GetQuantityFromStack(object stack)
        {
            // Convert the stack object to a string.
            string stackAsString = Convert.ToString(stack);

            // If the string representation contains a decimal point, ignore it.
            if (stackAsString.Contains("."))
            {
                return 0;
            }

            // Check for "False" interpreted as quantity 1.
            if (stackAsString.Trim().Equals("False", StringComparison.OrdinalIgnoreCase))
            {
                return 1;
            }

            // Try parsing the string as an integer.
            if (int.TryParse(stackAsString, out int intValue))
            {
                return intValue; // Use the integer value as the quantity.
            }

            // All other cases, including non-numeric strings or bool true, are ignored.
            return 0;
        }
    }
}
