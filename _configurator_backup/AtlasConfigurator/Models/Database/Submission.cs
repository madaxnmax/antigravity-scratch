using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AtlasConfigurator.Models.Database
{
    [Table("Submissions")]
    public class Submission
    {
        [Key]
        public int Id { get; set; }
        public string Username { get; set; }
        public string? Email { get; set; }
        public string Cart { get; set; }
        public DateTime Createdon { get; set; }
        public string CustomerNumber { get; set; }
        public string CustomerName { get; set; }
        public string QuoteNo { get; set; }
    }
}
