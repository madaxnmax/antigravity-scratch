using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AtlasConfigurator.Models.Database
{
    [Table("BandMultiplier")]
    public class BandMultiplier
    {
        [Key]
        public int Id { get; set; }
        public decimal BandSize { get; set; }
        public decimal ToleranceMultiplier { get; set; }
    }

}
