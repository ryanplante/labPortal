using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabPortal.Models.Dto
{
    public class AuditLogDto
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LogId { get; set; }
        public string? Description { get; set; }
        public DateTime? Timestamp { get; set; }
    }
}
