namespace AtlasConfigurator.Models.CutAlgorithm
{
    public class Calculations
    {
    }
    public class OptimizationRequest
    {
        public List<Stock> Stocks { get; set; }
        public List<Part> Parts { get; set; }
        public Saw Saw { get; set; }
    }

    public class Stock
    {
        public string Name { get; set; }
        public double Length { get; set; }  // Along the Y-axis
        public double Width { get; set; }   // Along the X-axis
        public double Thickness { get; set; }
        public int Quantity { get; set; }
        public bool AutoAdd { get; set; }
        public string Type { get; set; }    // "sheet" or "tube"
        public double Cost { get; set; }
    }


    public class Part
    {
        public string Name { get; set; }
        public double Length { get; set; }  // Along the Y-axis
        public double Width { get; set; }   // Along the X-axis
        public double Thickness { get; set; }
        public int Quantity { get; set; }
        public bool? OrientationLock { get; set; }  // true = cannot rotate, false = can rotate

        public Part Clone()
        {
            return new Part
            {
                Name = this.Name,
                Length = this.Length,
                Width = this.Width,
                Thickness = this.Thickness,
                Quantity = this.Quantity,
                OrientationLock = this.OrientationLock
            };
        }
    }

    public class Saw
    {
        public double BladeWidth { get; set; }        // Kerf
        public string CutType { get; set; }           // "guillotine"
        public string CutPreference { get; set; }     // "w" or "l" for width-first or length-first
        public GuillotineOptions GuillotineOptions { get; set; }
        public int StackHeight { get; set; }          // Number of sheets that can be cut simultaneously
    }

    public class GuillotineOptions
    {
        public string Strategy { get; set; }          // "best-fit", "first-fit", etc.
    }

    public class Rectangle
    {
        public double X { get; set; }       // X-coordinate on the stock
        public double Y { get; set; }       // Y-coordinate on the stock
        public double Width { get; set; }
        public double Height { get; set; }  // Equivalent to Length
    }

    public class Node
    {
        public Rectangle Rect { get; set; }
        public bool IsOccupied { get; set; }
        public Node Left { get; set; }
        public Node Right { get; set; }
        public Part PlacedPart { get; set; }

        public Node(double x, double y, double width, double height)
        {
            Rect = new Rectangle { X = x, Y = y, Width = width, Height = height };
            IsOccupied = false;
        }
    }
}
