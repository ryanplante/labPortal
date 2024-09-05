using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class Lab
    {
        public Lab()
        {
            Items = new HashSet<Item>();
            Logs = new HashSet<Log>();
            ScheduleExemptions = new HashSet<ScheduleExemption>();
        }

        public int LabId { get; set; }
        public string? Name { get; set; }
        public string? RoomNum { get; set; }
        public int? DeptId { get; set; }

        public virtual Department? Dept { get; set; }
        public virtual ICollection<Item> Items { get; set; }
        public virtual ICollection<Log> Logs { get; set; }
        public virtual ICollection<ScheduleExemption> ScheduleExemptions { get; set; }
    }
}
