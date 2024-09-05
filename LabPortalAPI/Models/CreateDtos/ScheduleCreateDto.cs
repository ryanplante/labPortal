namespace LabPortal.Models.CreateDtos
{
    public class ScheduleCreateDto
    {
        public int? UserId { get; set; }
        public int? FkLab { get; set; }
        public string? TimeIn { get; set; }
        public string? TimeOut { get; set; }
        public int? DayOfWeek { get; set; }
        public int? FkScheduleType { get; set; }
        public string? Location { get; set; }
    }
}
