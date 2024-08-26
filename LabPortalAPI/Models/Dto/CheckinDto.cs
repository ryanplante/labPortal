namespace LabPortal.Models.Dto
{
    public class CheckinDto
    {
        public int SummaryId { get; set; }
        public int? StudentId { get; set; }
        public DateTime? Timein { get; set; }
        public DateTime? Timeout { get; set; }
        public int? LabId { get; set; }
        public int? ItemId { get; set; }
        public int? MonitorId { get; set; } 
        public bool? IsDeleted { get; set; }
    }
}
