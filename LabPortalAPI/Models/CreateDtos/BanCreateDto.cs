namespace LabPortal.Models.CreateDtos
{
    public class BanCreateDto
    {
        public int UserId { get; set; }
        public string? Reason { get; set; }
        public DateTime? ExpirationDate { get; set; }
    }
}
