using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class PermissionLookup
    {
        public PermissionLookup()
        {
            Users = new HashSet<User>();
        }

        public int UserLevel { get; set; }
        public string? Name { get; set; }

        public virtual ICollection<User> Users { get; set; }
    }
}
