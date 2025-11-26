using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AtlasConfigurator.Models.Database
{
    [Table("ExtendedText")]
    public class ExtendedText
    {
        [Key]
        public int Id { get; set; }
        public string Grade { get; set; }
        public string ExtendedTextDescription { get; set; }
    }

}
