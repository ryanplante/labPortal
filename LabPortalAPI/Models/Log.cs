using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class Log
    {
        public int LogId { get; set; }
        public int? StudentId { get; set; }
        public DateTime? TimeIn { get; set; }
        public DateTime? TimeOut { get; set; }
        public int? LabId { get; set; }

        public virtual Lab? Lab { get; set; }
        public virtual User? Student { get; set; }
    }
}
