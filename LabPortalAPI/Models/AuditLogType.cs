using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class AuditLogType
    {
        public AuditLogType()
        {
            AuditLogs = new HashSet<AuditLog>();
        }

        public int Id { get; set; }
        public string Name { get; set; } = null!;

        public virtual ICollection<AuditLog> AuditLogs { get; set; }
    }
}
