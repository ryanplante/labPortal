using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class ChatLog
    {
        public int LogId { get; set; }
        public int? UserId { get; set; }
        public string? Message { get; set; }
        public DateTime? Timestamp { get; set; }

        public virtual User? User { get; set; }
    }
}
