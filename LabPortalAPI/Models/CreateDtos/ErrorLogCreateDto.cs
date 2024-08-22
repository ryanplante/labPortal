namespace LabPortal.Models.CreateDtos
{
    public class ErrorLogCreateDto
    {
        public int? LogType { get; set; }
        public DateTime? Timestamp { get; set; }
        public string? Description { get; set; }
        public string? Stack { get; set; }
        public string? Source { get; set; }
        public int? UserId { get; set; }
        public string? Platform { get; set; }
        public string? Version { get; set; }
    }
}
