using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class LogSummary
    {
        public int SummaryId { get; set; }
        public int? StudentId { get; set; }
        public int? LabId { get; set; }
        public int? MonitorId { get; set; }
        public DateTime? CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }
        public DateTime? LastUpdateTime { get; set; }
        public bool? IsDeleted { get; set; }
        public int? ItemId { get; set; }

        public virtual Item? Item { get; set; }
        public virtual Lab? Lab { get; set; }
    }
}
