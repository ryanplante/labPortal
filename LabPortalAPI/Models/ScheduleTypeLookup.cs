using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class ScheduleTypeLookup
    {
        public ScheduleTypeLookup()
        {
            ScheduleFkLabNavigations = new HashSet<Schedule>();
            ScheduleFkScheduleTypeNavigations = new HashSet<Schedule>();
        }

        public int TypeId { get; set; }
        public string? TypeName { get; set; }

        public virtual ICollection<Schedule> ScheduleFkLabNavigations { get; set; }
        public virtual ICollection<Schedule> ScheduleFkScheduleTypeNavigations { get; set; }
    }
}
