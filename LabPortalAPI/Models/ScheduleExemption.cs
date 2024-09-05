using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class ScheduleExemption
    {
        public int PkScheduleExemptions { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int FkExemptionType { get; set; }
        public int FkUser { get; set; }
        public int FkLab { get; set; }
        public bool Verified { get; set; }
        public int? FkSchedule { get; set; }

        public virtual ExemptionTypeLookup FkExemptionTypeNavigation { get; set; } = null!;
        public virtual Lab FkLabNavigation { get; set; } = null!;
        public virtual Schedule? FkScheduleNavigation { get; set; }
        public virtual User FkUserNavigation { get; set; } = null!;
    }
}
