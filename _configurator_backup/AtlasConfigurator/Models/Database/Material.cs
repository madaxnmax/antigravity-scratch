using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AtlasConfigurator.Models.Database
{
    [Table("Materials")]
    public class Material
    {
        [Key]
        public int Id { get; set; }
        public string No { get; set; }
        public string Grade { get; set; }
        public string Size { get; set; }
        [Column(TypeName = "decimal(5, 3)")]
        public decimal Thickness { get; set; }
        public string Color { get; set; }
        public decimal Kerf { get; set; }
        public int Length { get; set; }
        public int Width { get; set; }
    }

}
