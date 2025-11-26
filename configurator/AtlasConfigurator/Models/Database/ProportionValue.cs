using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AtlasConfigurator.Models.Database
{
    [Table("ProportionValue")]
    public class ProportionValue
    {
        [Key]
        public int Id { get; set; }
        public int Length { get; set; }
        public int Width { get; set; }
        public string Percentage { get; set; }
    }

}
