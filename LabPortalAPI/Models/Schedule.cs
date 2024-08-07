using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class Schedule
    {
        public int ScheduleId { get; set; }
        public int? UserId { get; set; }
        public int? ScheduleType { get; set; }
        public string? TextSchedule { get; set; }
        public int? Location { get; set; }

        public virtual Lab? LocationNavigation { get; set; }
        public virtual ScheduleTypeLookup? ScheduleTypeNavigation { get; set; }
        public virtual User? User { get; set; }
    }
}
