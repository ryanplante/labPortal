using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabPortal.Models.Dto
{
    public class PermissionLookupDto
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserLevel { get; set; }
        public string? Name { get; set; }
    }
}
