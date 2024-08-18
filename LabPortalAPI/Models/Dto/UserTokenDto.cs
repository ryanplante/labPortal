namespace LabPortal.Models.Dto
{
    public class UserTokenDto
    {
        public Guid TokenId { get; set; }
        public int? FkUserId { get; set; }
        public string? Token { get; set; }
        public DateTime? Expiration { get; set; }
    }
}
