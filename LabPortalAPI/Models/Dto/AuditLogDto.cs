namespace LabPortal.Models.Dto
{
    public class AuditLogDto
    {
        public string? Description { get; set; }
        public int userID { get; set; }
        public int AuditLogTypeId { get; set; }
        public DateTime? Timestamp { get; set; }
    }
}
