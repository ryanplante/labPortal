using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class Item
    {
        public Item()
        {
            ItemLogs = new HashSet<ItemLog>();
        }

        public int ItemId { get; set; }
        public string? Description { get; set; }
        public int? Quantity { get; set; }
        public string? SerialNum { get; set; }

        public virtual ICollection<ItemLog> ItemLogs { get; set; }
    }
}
