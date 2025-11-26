using Newtonsoft.Json;

namespace AtlasConfigurator.Models.SmartCut
{
    public class SmartResponse
    {
        public ResponseSaw Saw { get; set; }
        public List<ResponseStock> Stock { get; set; }
        public List<ResponsePart> Parts { get; set; }
        public List<ResponseCut> Cuts { get; set; }
        public List<ResponseOffcut> Offcuts { get; set; }
        public ResponseMetadata Metadata { get; set; }
        public string? File { get; set; }
        public string jobId { get; set; }
    }

    public class ResponseSaw
    {
        public double? BladeWidth { get; set; }
        public string? CutType { get; set; }
        public string? CutPreference { get; set; }
        public ResponseGuillotineOptions GuillotineOptions { get; set; }
        public double? StackHeight { get; set; }
        [JsonProperty("stockType")] // JSON property names should match the JSON response
        public string? StockType { get; set; }
        public object? Options { get; set; } // Assuming 'object?' due to "options": null in JSON
    }

    public class ResponseGuillotineOptions
    {
        public string? Strategy { get; set; }
    }

    public class ResponseStock
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public bool? Duplicate { get; set; }
        public bool? Used { get; set; }
        public double? L { get; set; }
        public double? W { get; set; }
        public double? T { get; set; }
        public string? Material { get; set; }
        public string? Grain { get; set; }
        public ResponseTrim Trim { get; set; }
        public string? Type { get; set; }
        public double? Cost { get; set; }
        public object? Stack { get; set; } // Updated to nullable to match the potential absence in JSON
        public ResponseAnalysis Analysis { get; set; }
        public List<string?> Issues { get; set; } // Assuming presence due to "issues": [] in JSON
        public string? Notes { get; set; }
    }

    public class ResponseAnalysis
    {
        public double? AreaEfficiency { get; set; }
        public double? BandingLength { get; set; }
        public double? CutLength { get; set; }
        [JsonProperty("stackedCutLength")]
        public double? StackedCutLength { get; set; }
        public int? NumberOfCuts { get; set; }
        [JsonProperty("stackedNumberOfCuts")]
        public int? StackedNumberOfCuts { get; set; }
        public double? PartArea { get; set; }
        public int? TotalParts { get; set; }
        public double? RollLength { get; set; }
    }

    public class ResponseTrim
    {
        public double? X1 { get; set; } // Nullable to allow for the absence in JSON
        public double? X2 { get; set; }
        public double? Y1 { get; set; }
        public double? Y2 { get; set; }
    }

    public class ResponsePart
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public bool? Duplicate { get; set; }
        public bool? Added { get; set; }
        public double? X { get; set; }
        public double? Y { get; set; }
        public double? L { get; set; }
        public double? W { get; set; }
        public double? T { get; set; }
        public string? Material { get; set; }
        public bool? Rot { get; set; }
        public ResponseBanding Banding { get; set; }
        public ResponseBandingType BandingType { get; set; }
        public ResponseStock Stock { get; set; }
        public List<string?> Issues { get; set; }
        public string? Notes { get; set; }
    }

    public class ResponseCut
    {
        public bool? Guillotine { get; set; }
        [JsonProperty("guillotineData")]
        public object? GuillotineData { get; set; } // Assuming 'object?' due to the specific structure in JSON
        public bool? IsTrim { get; set; }
        public ResponseStock Stock { get; set; }
        public double? X1 { get; set; }
        public double? X2 { get; set; }
        public double? Y1 { get; set; }
        public double? Y2 { get; set; }
        public double? Order { get; set; }
    }
    public class ResponseOffcut
    {
        public double? X { get; set; }
        public double? Y { get; set; }
        public double? L { get; set; }
        public double? W { get; set; }
        public double? T { get; set; }
        public int? Q { get; set; }
        public string? Material { get; set; }
        public ResponseStock Stock { get; set; }
        public string? Grain { get; set; }
        public string? Type { get; set; }
    }

    public class ResponseMetadata
    {
        public double? TotalStockCost { get; set; }
        public List<ResponseUnusedStock> UnusedStock { get; set; }
        public List<ResponseUnplacedPart> UnplacedParts { get; set; }
        public ResponseUsedStockTally UsedStockTally { get; set; }
        public double? TotalCutLength { get; set; }
        public double? TotalBandingLength { get; set; }
        public ResponseBandingLengthByType BandingLengthByType { get; set; }
        public double? TotalEfficiency { get; set; } // Added to match JSON "totalEfficiency"
        public double? TotalPartArea { get; set; } // Added to match JSON "totalPartArea"
                                                   // Other metadata properties as needed
    }

    public class ResponseUnusedStock
    {
        public int? Count { get; set; }
        public int? ParentID { get; set; }
        public string? Name { get; set; }
        public double? L { get; set; }
        public double? W { get; set; }
    }

    public class ResponseUnplacedPart
    {
        public int? Count { get; set; }
        public int? ParentID { get; set; }
        public string? Name { get; set; }
        public double? L { get; set; }
        public double? W { get; set; }
    }

    public class ResponseUsedStockTally
    {
        public string? Stock { get; set; }
        public int? Qty { get; set; }
    }

    public class ResponseBanding
    {
        public bool? X1 { get; set; }
        public bool? X2 { get; set; }
        public bool? Y1 { get; set; }
        public bool? Y2 { get; set; }
    }

    public class ResponseBandingType
    {
        public string? X1 { get; set; }
        public object? X2 { get; set; } // Made object? to match potential JSON variability
        public object? Y1 { get; set; }
        public string? Y2 { get; set; }
    }

    public class ResponseBandingLengthByType
    {
        [JsonProperty("type 1")]
        public double? Type1 { get; set; } // Changed to double? assuming numeric value

        [JsonProperty("type 2")]
        public double? Type2 { get; set; } // Changed to double? assuming numeric value
    }

}