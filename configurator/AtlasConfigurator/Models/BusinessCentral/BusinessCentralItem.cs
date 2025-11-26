using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AtlasConfigurator.Models.BusinessCentral
{
    [Table("BusinessCentralItem")]
    public class BusinessCentralItem
    {
        [Key]
        public int id { get; set; }
        public string No { get; set; }
        public string Description { get; set; }
        public decimal UnitPrice { get; set; }
        public string Grade { get; set; }
        public string Color { get; set; }
        public string CutSand { get; set; }
        public string NominalThickness { get; set; }
        public string MaxThickness { get; set; }
        public string MinThickness { get; set; }
        public string NominalLength { get; set; }
        public string MaxLength { get; set; }
        public string MinLength { get; set; }
        public string NominalWidth { get; set; }
        public string MaxWidth { get; set; }
        public string MinWidth { get; set; }
        public int Quantity { get; set; }
        public string Kerf { get; set; }
        public string BaseUOM { get; set; }
        public double GrossWeight { get; set; }
        public double NetWeight { get; set; }
    }
}
