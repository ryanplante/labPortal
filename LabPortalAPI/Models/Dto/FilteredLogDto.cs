namespace LabPortal.Models.Dto
{
    public class FilteredLogDto
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public DateTime TimeIn { get; set; }
        public DateTime? TimeOut { get; set; }
        public int MonitorID { get; set; }
    }
}
