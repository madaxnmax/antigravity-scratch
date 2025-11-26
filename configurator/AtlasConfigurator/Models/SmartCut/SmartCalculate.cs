namespace AtlasConfigurator.Models.SmartCut
{
    public class SmartCalculate
    {
        public Saw saw { get; set; }
        public List<Stock> stock { get; set; }
        public List<Part> parts { get; set; }
        public string webhook { get; set; }
        public string JobId { get; set; }
    }

    public class Banding
    {
        public bool x1 { get; set; }
        public bool x2 { get; set; }
        public bool y1 { get; set; }
        public bool y2 { get; set; }
    }
    public class Data
    {
        public string id { get; set; }
    }

    public class BandingType
    {
        public string x1 { get; set; }
        public object x2 { get; set; }
        public object y1 { get; set; }
        public string y2 { get; set; }
    }

    public class EfficiencyOptions
    {
        public string primaryCompression { get; set; }
    }

    public class GuillotineOptions
    {
        public string strategy { get; set; }
    }

    public class Part
    {
        public string name { get; set; }
        public decimal l { get; set; }
        public decimal w { get; set; }
        public decimal t { get; set; }
        //public string material { get; set; }
        public int q { get; set; }
        //public Banding banding { get; set; }
        //public BandingType bandingType { get; set; }
        public string orientationLock { get; set; }
    }

    public class Saw
    {
        public double bladeWidth { get; set; }
        public string cutType { get; set; }
        public string cutPreference { get; set; }
        public GuillotineOptions guillotineOptions { get; set; }
        //public EfficiencyOptions efficiencyOptions { get; set; }
        public double stackHeight { get; set; }
    }

    public class Stock
    {
        public string name { get; set; }
        public double l { get; set; }
        public double w { get; set; }
        public double t { get; set; }
        //public string material { get; set; }
        public int q { get; set; }
        public bool autoAdd { get; set; }
        //public string grain { get; set; }
        //public Trim trim { get; set; }
        //public bool allowExactFitShapes { get; set; }
        public string type { get; set; }
        public double cost { get; set; }
    }

    public class Trim
    {
        public double x1 { get; set; }
        public double x2 { get; set; }
        public double y1 { get; set; }
        public double y2 { get; set; }
    }
}
