namespace AtlasConfigurator.Workers
{
    public class LengthWidth
    {
        public int Length { get; set; }
        public int Width { get; set; }

        public LengthWidth GetLengthWidthFromCombinedSize(string selectedSize)
        {
            try
            {
                string[] dimensions = selectedSize?.Split('x') ?? new string[0];
                if (dimensions.Length != 2)
                {
                    // Handle error: selectedSize format is not as expected.
                    return null;
                }
                string selectedLength = dimensions[0];
                string selectedWidth = dimensions[1];
                var LengthWidth = new LengthWidth { Length = Convert.ToInt32(selectedLength), Width = Convert.ToInt32(selectedWidth) };
                return LengthWidth;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetLengthWidthFromCombinedSize: {ex.Message}");
                return null;
            }
        }
    }
}
