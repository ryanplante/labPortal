namespace LabPortal.Models.Dto
{
    public class BanDto
    {
        public int BanId { get; set; }
        public int? UserId { get; set; }
        public string? Reason { get; set; }
        public DateTime? ExpirationDate { get; set; }
    }
}
