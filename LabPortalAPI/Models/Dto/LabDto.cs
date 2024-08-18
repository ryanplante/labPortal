using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabPortal.Models.Dto
{
    public class LabDto
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LabId { get; set; }
        public string? Name { get; set; }
        public string? RoomNum { get; set; }
        public int? DeptId { get; set; }
    }
}
