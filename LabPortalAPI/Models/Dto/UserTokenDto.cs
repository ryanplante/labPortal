using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabPortal.Models.Dto
{
    public class UserTokenDto
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid TokenId { get; set; }
        public int? FkUserId { get; set; }
        public string? Token { get; set; }
        public DateTime? Expiration { get; set; }
    }
}
