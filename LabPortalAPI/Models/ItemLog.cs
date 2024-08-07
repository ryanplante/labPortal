using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class ItemLog
    {
        public int LogId { get; set; }
        public int? ItemId { get; set; }
        public DateTime? Timestamp { get; set; }
        public string? TransactionType { get; set; }
        public int? StudentId { get; set; }
        public int? MonitorId { get; set; }

        public virtual Item? Item { get; set; }
        public virtual User? Monitor { get; set; }
        public virtual User? Student { get; set; }
    }
}
