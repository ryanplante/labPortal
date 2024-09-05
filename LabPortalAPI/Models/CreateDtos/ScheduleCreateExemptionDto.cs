namespace LabPortal.Models.CreateDtos
{
    public class ScheduleCreateExemptionDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int FkExemptionType { get; set; }
        public int FkUser { get; set; }
        public int FkLab { get; set; }
        public bool Verified { get; set; }
        public int? FkSchedule { get; set; }
    }
}
