using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class PositionLookup
    {
        public PositionLookup()
        {
            Users = new HashSet<User>();
        }

        public int PositionId { get; set; }
        public string? Details { get; set; }

        public virtual ICollection<User> Users { get; set; }
    }
}
