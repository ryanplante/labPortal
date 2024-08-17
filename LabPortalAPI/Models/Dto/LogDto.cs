namespace LabPortal.Models.Dto
{
    public class LogDto
    {
        public int LogId { get; set; }
        public int? StudentId { get; set; }
        public DateTime? TimeIn { get; set; }
        public DateTime? TimeOut { get; set; }
        public int? LabId { get; set; }
    }
}
