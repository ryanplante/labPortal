using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class ExemptionTypeLookup
    {
        public ExemptionTypeLookup()
        {
            ScheduleExemptions = new HashSet<ScheduleExemption>();
        }

        public int PkType { get; set; }
        public string? Name { get; set; }

        public virtual ICollection<ScheduleExemption> ScheduleExemptions { get; set; }
    }
}
