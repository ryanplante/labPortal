using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LabPortal.Models
{
    public partial class Ban
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BanId { get; set; }
        public int? UserId { get; set; }
        public string? Reason { get; set; }
        public DateTime? ExpirationDate { get; set; }

        public virtual User? User { get; set; }
    }
}
