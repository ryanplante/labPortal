namespace LabPortal.Models.CreateDtos
{
    public class LogCreateDto
    {
        public int? StudentId { get; set; }
        public DateTime Timein { get; set; }
        public DateTime? Timeout { get; set; }
        public int LabId { get; set; }
        public int ? ItemId { get; set; }
        public int MonitorId { get; set; } // Foreign key reference to Users table
    }
}
