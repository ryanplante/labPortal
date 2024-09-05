namespace LabPortal.Models.Dto
{
    public class DeptScheduleDto
    {
        public int ScheduleId { get; set; }
        public int DayOfWeek { get; set; }
        public string Hours { get; set; }
        public int? FkLab { get; set; }
        public string? Lab { get; set; }
        public int UserId { get; set; }
        public string User { get; set; }
        public string ScheduleType { get; set; } // This should be a string to match the stored procedure's result
    }
}
