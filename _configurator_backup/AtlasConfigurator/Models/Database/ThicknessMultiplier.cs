using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AtlasConfigurator.Models.Database
{
    [Table("ThicknessMultiplier")]
    public class ThicknessMultiplier
    {
        [Key]
        public int Id { get; set; }
        public decimal ThicknessMin { get; set; }
        public decimal ThicknessMax { get; set; }
        public string ThicknessFormula { get; set; }
        public decimal ThicknessMultiplierValue { get; set; }
    }

}
