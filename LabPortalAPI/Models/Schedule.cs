using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class Schedule
    {
        public int ScheduleId { get; set; }
        public int? UserId { get; set; }
        public int? FkLab { get; set; }
        public int? Location { get; set; }
        public string? TimeIn { get; set; }
        public string? TimeOut { get; set; }
        public int? DayOfWeek { get; set; }

        public virtual Lab? LocationNavigation { get; set; }
        public virtual User? User { get; set; }
    }
}
