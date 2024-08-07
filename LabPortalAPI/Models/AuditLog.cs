using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class AuditLog
    {
        public int LogId { get; set; }
        public string? Description { get; set; }
        public DateTime? Timestamp { get; set; }
    }
}
