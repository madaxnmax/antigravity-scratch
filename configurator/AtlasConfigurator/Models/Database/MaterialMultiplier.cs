using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AtlasConfigurator.Models.Database
{
    [Table("MaterialMultiplier")]
    public class MaterialMultiplier
    {
        [Key]
        public int Id { get; set; }
        public string Grade { get; set; }
        public decimal MaterialMultiplierValue { get; set; }
        public decimal Density { get; set; }
    }

}
