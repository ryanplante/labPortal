using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class Department
    {
        public Department()
        {
            Labs = new HashSet<Lab>();
            Users = new HashSet<User>();
        }

        public int DeptId { get; set; }
        public string? Name { get; set; }
        public string? Password { get; set; }

        public virtual ICollection<Lab> Labs { get; set; }
        public virtual ICollection<User> Users { get; set; }
    }
}
