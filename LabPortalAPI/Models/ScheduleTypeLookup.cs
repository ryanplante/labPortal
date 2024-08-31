using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class ScheduleTypeLookup
    {
        public ScheduleTypeLookup()
        {
            Schedules = new HashSet<Schedule>();
        }

        public int TypeId { get; set; }
        public string? TypeName { get; set; }

        public virtual ICollection<Schedule> Schedules { get; set; }
    }
}
