using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabPortal.Models.Dto
{
    public class ItemLogDto
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LogId { get; set; }
        public int? ItemId { get; set; }
        public DateTime? Timestamp { get; set; }
        public string? TransactionType { get; set; }
        public int? StudentId { get; set; }
        public int? MonitorId { get; set; }
    }
}
