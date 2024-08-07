using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class ErrorLogTypeLookup
    {
        public ErrorLogTypeLookup()
        {
            ErrorLogs = new HashSet<ErrorLog>();
        }

        public int TypeId { get; set; }
        public string? TypeName { get; set; }

        public virtual ICollection<ErrorLog> ErrorLogs { get; set; }
    }
}
