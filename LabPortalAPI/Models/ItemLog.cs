using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class ItemLog
    {
        public ItemLog()
        {
            InverseFkParentTransactionNavigation = new HashSet<ItemLog>();
        }

        public int LogId { get; set; }
        public int? ItemId { get; set; }
        public DateTime? Timestamp { get; set; }
        public int? TransactionType { get; set; }
        public int? StudentId { get; set; }
        public int? MonitorId { get; set; }
        public int? FkParentTransaction { get; set; }

        public virtual ItemLog? FkParentTransactionNavigation { get; set; }
        public virtual Item? Item { get; set; }
        public virtual User? Monitor { get; set; }
        public virtual User? Student { get; set; }
        public virtual TransactionTypeLookup? TransactionTypeNavigation { get; set; }
        public virtual ICollection<ItemLog> InverseFkParentTransactionNavigation { get; set; }
    }
}
