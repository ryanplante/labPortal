using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabPortal.Models.Dto
{
    public class ChatLogDto
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LogId { get; set; }
        public int? UserId { get; set; }
        public string? Message { get; set; }
        public DateTime? Timestamp { get; set; }
    }
}
