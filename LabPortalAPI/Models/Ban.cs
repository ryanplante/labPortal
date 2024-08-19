using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class Ban
    {
        public int BanId { get; set; }
        public int UserId { get; set; }
        public string? Reason { get; set; }
        public DateTime? ExpirationDate { get; set; }

        public virtual User? User { get; set; }
    }
}
