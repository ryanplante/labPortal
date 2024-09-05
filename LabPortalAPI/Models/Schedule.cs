using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class Schedule
    {
        public Schedule()
        {
            ScheduleExemptions = new HashSet<ScheduleExemption>();
        }

        public int ScheduleId { get; set; }
        public int? UserId { get; set; }
        public int? FkLab { get; set; }
        public string? TimeIn { get; set; }
        public string? TimeOut { get; set; }
        public int? DayOfWeek { get; set; }
        public int? FkScheduleType { get; set; }
        public string? Location { get; set; }

        public virtual ScheduleTypeLookup? FkLabNavigation { get; set; }
        public virtual ScheduleTypeLookup? FkScheduleTypeNavigation { get; set; }
        public virtual User? User { get; set; }
        public virtual ICollection<ScheduleExemption> ScheduleExemptions { get; set; }
    }
}
