namespace LabPortal.Models.Dto
{
    public class ErrorLogDto
    {
        public int LogId { get; set; }
        public int? LogType { get; set; }
        public DateTime? Timestamp { get; set; }
        public string? Description { get; set; }
        public string? Stack { get; set; }
        public string? Source { get; set; }
        public int? UserId { get; set; }

        public string? Version { get; set; }
        public string? Platform { get; set; }
    }
}
