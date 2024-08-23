using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class TransactionTypeLookup
    {
        public TransactionTypeLookup()
        {
            ItemLogs = new HashSet<ItemLog>();
            Logs = new HashSet<Log>();
        }

        public int TypeId { get; set; }
        public string? TypeName { get; set; }

        public virtual ICollection<ItemLog> ItemLogs { get; set; }
        public virtual ICollection<Log> Logs { get; set; }
    }
}
