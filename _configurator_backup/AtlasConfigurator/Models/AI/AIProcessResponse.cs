using Newtonsoft.Json;
using System.Runtime.Serialization;

namespace AtlasConfigurator.Models.AI
{
    // Root myDeserializedClass = JsonConvert.DeserializeObject<Root>(myJsonResponse);
    public class AIResponse
    {
        public List<object> ring_value { get; set; }
        public List<object> rod_value { get; set; }
        public List<SheetValue> sheet_value { get; set; }
        public List<object> tube_value { get; set; }
    }

    public class EmailData
    {
        public string from_address { get; set; }
        public string to_address { get; set; }
        public string date { get; set; }
        public string subject { get; set; }
        public string body { get; set; }
    }

    public class RingValue
    {
        public string Grade { get; set; }

        [JsonProperty("Synonyms (optional)")]
        public string Synonymsoptional { get; set; }
        public string Color { get; set; } = "Natural";

        [JsonProperty("Outer Diameter")]
        public string OuterDiameter { get; set; }

        [JsonProperty("Outer Diameter + Tolerance")]
        public string OuterDiameterTolerancePlus { get; set; }

        [JsonProperty("Outer Diameter - Tolerance")]
        public string RingOuterDiameterToleranceMinus { get; set; }

        [JsonProperty("Outer Diameter Unit of Measure")]
        public string OuterDiameterUnitofMeasure { get; set; }

        [JsonProperty("Inner Diameter")]
        public string InnerDiameter { get; set; }

        [JsonProperty("Inner Diameter + Tolerance")]
        public string InnerDiameterTolerancePlus { get; set; }

        [JsonProperty("Inner Diameter - Tolerance")]
        public string RingInnerDiameterToleranceMinus { get; set; }

        [JsonProperty("Inner Diameter Unit of Measure")]
        public string InnerDiameterUnitofMeasure { get; set; }

        public string Thickness { get; set; }

        [JsonProperty("Thickness + Tolerance")]
        public string ThicknessTolerancePlus { get; set; }

        [JsonProperty("Thickness - Tolerance")]
        public string RingThicknessToleranceMinus { get; set; }

        [JsonProperty("Thickness Unit of Measure")]
        public string ThicknessUnitofMeasure { get; set; }

        public string Quantity { get; set; }

        [JsonProperty("Quantity Unit of Measure")]
        public string QuantityUnitofMeasure { get; set; }

        [JsonProperty("Testing Required")]
        public string TestingRequired { get; set; }

        [JsonProperty("Domestic Material")]
        public string DomesticMaterial { get; set; }

        [OnDeserialized]
        private void OnDeserialized(StreamingContext context)
        {
            // Check each property and set default if it's null or empty
            Color = string.IsNullOrWhiteSpace(Color) ? "Natural" : Color;

        }
    }


    public class RodValue
    {
        public string Grade { get; set; }

        [JsonProperty("Synonyms(optional)")]
        public string Synonymsoptional { get; set; }
        public string Color { get; set; } = "Natural";
        public string Diameter { get; set; }

        [JsonProperty("Diameter + Tolerance")]
        public string DiameterTolerancePlus { get; set; }

        [JsonProperty("Diameter - Tolerance")]
        public string RodDiameterToleranceMinus { get; set; }

        [JsonProperty("Diameter Unit of Measure")]
        public string DiameterUnitofMeasure { get; set; }
        public string Length { get; set; }

        [JsonProperty("Length + Tolerance")]
        public string LengthTolerancePlus { get; set; }

        [JsonProperty("Length - Tolerance")]
        public string RodLengthToleranceMinus { get; set; }

        [JsonProperty("Length Unit of Measure")]
        public string LengthUnitofMeasure { get; set; }
        public string Quantity { get; set; }

        [JsonProperty("Quantity Unit of Measure")]
        public string QuantityUnitofMeasure { get; set; }

        [JsonProperty("Rolled and Molded")]
        public string RolledandMolded { get; set; }

        [JsonProperty("Testing Required")]
        public string TestingRequired { get; set; }

        [JsonProperty("Domestic Material")]
        public string DomesticMaterial { get; set; }

        [OnDeserialized]
        private void OnDeserialized(StreamingContext context)
        {
            // Check each property and set default if it's null or empty
            Color = string.IsNullOrWhiteSpace(Color) ? "Natural" : Color;

        }
    }

    public class AIProcessResponse
    {
        public AIResponse AI_Response { get; set; }
        public EmailData email_data { get; set; }
        public List<SheetValue> sheet_value { get; set; }
        public List<RodValue> rod_value { get; set; }
        public List<TubeValue> tube_value { get; set; }
        public List<RingValue> ring_value { get; set; }
    }

    public class SheetValue
    {
        public string Color { get; set; } = "Natural";

        [JsonProperty("Domestic Material")]
        public string DomesticMaterial { get; set; }
        public string Grade { get; set; }

        [JsonProperty("Grain Direction")]
        public string GrainDirection { get; set; }
        public string Length { get; set; } = "48";

        [JsonProperty("Length + Tolerance")]
        public string LengthTolerancePlus { get; set; }

        [JsonProperty("Length - Tolerance")]
        public string SheetLengthToleranceMinus { get; set; }

        [JsonProperty("Length Unit of Measure")]
        public string LengthUnitofMeasure { get; set; }

        [JsonProperty("Number of Masked sides")]
        public string NumberofMaskedsides { get; set; }

        [JsonProperty("Number of Sanded Sides")]
        public string NumberofSandedSides { get; set; }
        public string Quantity { get; set; }

        [JsonProperty("Quantity Unit of Measure")]
        public string QuantityUnitofMeasure { get; set; }

        [JsonProperty("Testing Required")]
        public string TestingRequired { get; set; }
        public string Thickness { get; set; }

        [JsonProperty("Thickness + Tolerance")]
        public string ThicknessTolerancePlus { get; set; }

        [JsonProperty("Thickness - Tolerance")]
        public string SheetThicknessToleranceMinus { get; set; }

        [JsonProperty("Thickness Unit of Measure")]
        public string ThicknessUnitofMeasure { get; set; }
        public string Width { get; set; } = "36";

        [JsonProperty("Width + Tolerance")]
        public string WidthTolerancePlus { get; set; }

        [JsonProperty("Width - Tolerance")]
        public string SheetWidthToleranceMinus { get; set; }

        [JsonProperty("Width Unit of Measure")]
        public string WidthUnitofMeasure { get; set; }

        [JsonProperty("Synonyms(optional)")]
        public string Synonymsoptional { get; set; }

        [OnDeserialized]
        private void OnDeserialized(StreamingContext context)
        {
            // Check each property and set default if it's null or empty
            Color = string.IsNullOrWhiteSpace(Color) ? "Natural" : Color;
            Length = string.IsNullOrWhiteSpace(Length) ? "48" : Length;
            Width = string.IsNullOrWhiteSpace(Width) ? "36" : Width;
            LengthTolerancePlus = string.IsNullOrWhiteSpace(LengthTolerancePlus) ? ".010" : LengthTolerancePlus;
            SheetLengthToleranceMinus = string.IsNullOrWhiteSpace(SheetLengthToleranceMinus) ? ".010" : SheetLengthToleranceMinus;
            // Add additional properties with defaults as needed
        }
    }

    public class TubeValue
    {
        public string Grade { get; set; } = "Natural";

        [JsonProperty("Synonyms(optional)")]
        public string Synonymsoptional { get; set; }
        public string Color { get; set; }

        [JsonProperty("Outer Diameter")]
        public string OuterDiameter { get; set; }

        [JsonProperty("Outer Diameter + Tolerance")]
        public string OuterDiameterTolerancePlus { get; set; }

        [JsonProperty("Outer Diameter - Tolerance")]
        public string TubeOuterDiameterToleranceMinus { get; set; }

        [JsonProperty("Outer Diameter Unit of Measure")]
        public string OuterDiameterUnitofMeasure { get; set; }

        [JsonProperty("Inner Diameter")]
        public string InnerDiameter { get; set; }

        [JsonProperty("Inner Diameter + Tolerance")]
        public string InnerDiameterTolerancePlus { get; set; }

        [JsonProperty("Inner Diameter - Tolerance")]
        public string TubeInnerDiameterToleranceMinus { get; set; }

        [JsonProperty("Inner Diameter Unit of Measure")]
        public string InnerDiameterUnitofMeasure { get; set; }
        public string Length { get; set; }

        [JsonProperty("Length + Tolerance")]
        public string LengthTolerancePlus { get; set; }

        [JsonProperty("Length - Tolerance")]
        public string TubeLengthToleranceMinus { get; set; }

        [JsonProperty("Length Unit of Measure")]
        public string LengthUnitofMeasure { get; set; }
        public string Quantity { get; set; }

        [JsonProperty("Quantity Unit of Measure")]
        public string QuantityUnitofMeasure { get; set; }

        [JsonProperty("Testing Required")]
        public string TestingRequired { get; set; }

        [JsonProperty("Domestic Material")]
        public string DomesticMaterial { get; set; }
    }



}
