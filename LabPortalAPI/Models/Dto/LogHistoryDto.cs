namespace LabPortal.Models.Dto
{
    public class LogHistoryDto
    {
        public int StudentId { get; set; }
        public DateTime Timestamp { get; set; }
        public string TransactionType { get; set; }
        public int LabId { get; set; }
        public int MonitorId { get; set; }
    }
}
