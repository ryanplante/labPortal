using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabPortal.Models.Dto
{
    public class ItemDto
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ItemId { get; set; }
        public string? Description { get; set; }
        public int? Quantity { get; set; }
        public int? SerialNum { get; set; }
    }
}
