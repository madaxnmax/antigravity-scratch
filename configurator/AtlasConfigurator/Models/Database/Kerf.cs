using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AtlasConfigurator.Models.Database
{
    [Table("Kerf")]
    public class Kerf
    {
        [Key]
        public int Id { get; set; }
        public string Grade { get; set; }
        public string Type { get; set; }
        public decimal Thickness { get; set; }
        public decimal KerfValue { get; set; }
    }
}
