using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class AuditLog
    {
        public int LogId { get; set; }
        public string? Description { get; set; }
        public DateTime? Timestamp { get; set; }
        public int? AuditLogTypeId { get; set; }
        public int UserId { get; set; }

        public virtual AuditLogType? AuditLogType { get; set; }
        public virtual User? User { get; set; }
    }
}
