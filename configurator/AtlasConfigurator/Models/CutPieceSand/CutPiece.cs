using System.ComponentModel.DataAnnotations;

namespace AtlasConfigurator.Models.CutPieceSand
{
    public class CutPiece
    {
        [Key]
        public int Id { get; set; }
        public decimal Width { get; set; }
        public decimal Length { get; set; }
        public int Quantity { get; set; }
        public decimal Thickness { get; set; }
        public string Color { get; set; }
        public decimal ToleranceMinusLength { get; set; }
        public decimal TolerancePlusLength { get; set; }
        public decimal ToleranceMinusWidth { get; set; }
        public decimal TolerancePlusWidth { get; set; }
        public string MaterialSelected { get; set; }
    }
}
