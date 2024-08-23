namespace LabPortal.Models.Dto
{
    public class ItemLogDto
    {
        public int LogId { get; set; }
        public int? ItemId { get; set; }
        public DateTime? Timestamp { get; set; }
        public int TransactionType { get; set; }
        public int? StudentId { get; set; }
        public int? MonitorId { get; set; }
    }
}
