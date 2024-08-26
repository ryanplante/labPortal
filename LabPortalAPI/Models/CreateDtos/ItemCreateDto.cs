namespace LabPortal.Models.CreateDtos
{
    public class ItemCreateDto
    {
        public string Description { get; set; }
        public int Quantity { get; set; }
        public string? SerialNum { get; set; }
        public int Lab { get; set; }
        public string? Picture { get; set; }
    }
}
