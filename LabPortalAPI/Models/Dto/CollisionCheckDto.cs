namespace LabPortal.Models.Dto
{
    public class CollisionCheckDto
    {
        public int UserID { get; set; }
        public string TimeIn { get; set; } // e.g. "09:00"
        public string TimeOut { get; set; } // e.g. "13:00"
        public int DayOfWeek { get; set; } // e.g. 0 for Monday
        public int Week { get; set; }
        public int? PkLog { get; set; }
    }
}
