namespace LabPortal.Models.Dto
{
    public class LogDto
    {
        public int LogId { get; set; }
        public int? StudentId { get; set; }
        public DateTime? Timestamp { get; set; }
        public int? LabId { get; set; }
        public int? MonitorId { get; set; } // Foreign key reference to Users table
        public int? FkParentTransaction { get; set; } // Foreign key reference to Logs table (self-referencing)
    }
}
