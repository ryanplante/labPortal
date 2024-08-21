using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class ErrorLog
    {
        public int LogId { get; set; }
        public int? LogType { get; set; }
        public DateTime? Timestamp { get; set; }
        public string? Description { get; set; }
        public string? Stack { get; set; }
        public string? Source { get; set; }
        public int? UserId { get; set; }
        public string? Platform { get; set; }
        public string? Version { get; set; }

        public virtual ErrorLogTypeLookup? LogTypeNavigation { get; set; }
        public virtual User? User { get; set; }
    }
}
