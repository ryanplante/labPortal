namespace LabPortal.Models.Dto
{
    public class ScheduleDto
    {
        public int ScheduleId { get; set; }
        public int? UserId { get; set; }
        public int? ScheduleType { get; set; }
        public string? TextSchedule { get; set; }
        public int? Location { get; set; }
    }
}
