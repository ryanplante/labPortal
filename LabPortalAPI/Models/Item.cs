using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class Item
    {
        public Item()
        {
            LogSummaries = new HashSet<LogSummary>();
            Logs = new HashSet<Log>();
        }

        public int ItemId { get; set; }
        public string Description { get; set; } = null!;
        public int Quantity { get; set; }
        public string? SerialNum { get; set; }
        public int FkLab { get; set; }
        public string? Picture { get; set; }

        public virtual Lab FkLabNavigation { get; set; } = null!;
        public virtual ICollection<LogSummary> LogSummaries { get; set; }
        public virtual ICollection<Log> Logs { get; set; }
    }
}
