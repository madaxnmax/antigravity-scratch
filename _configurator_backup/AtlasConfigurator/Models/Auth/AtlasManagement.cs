using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AtlasConfigurator.Models.Auth
{
    [Table("AtlasManagement")]
    public class AtlasManagement
    {
        [Key]
        public int Id { get; set; }
        public string Email { get; set; }
        public string WorkOsUserId { get; set; }
        public string Company { get; set; }
        public bool IsAdmin { get; set; }
    }
}
