using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class Log
    {
        public int LogId { get; set; }
        public int? StudentId { get; set; }
        public DateTime? Timestamp { get; set; }
        public int TransactionType { get; set; }
        public int? LabId { get; set; }
        public int? MonitorId { get; set; }
        public int? FkLog { get; set; }
        public int? ItemId { get; set; }

        public virtual Item? Item { get; set; }
        public virtual Lab? Lab { get; set; }
        public virtual User? Monitor { get; set; }
        public virtual User? Student { get; set; }
        public virtual TransactionTypeLookup TransactionTypeNavigation { get; set; } = null!;
    }
}
