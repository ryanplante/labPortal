namespace LabPortal.Models.Dto
{
    public class ChatLogDto
    {
        public int LogId { get; set; }
        public int? UserId { get; set; }
        public string? Message { get; set; }
        public DateTime? Timestamp { get; set; }
    }
}
