﻿namespace LabPortal.Models.Dto
{
    public class ScheduleDto
    {
        public int ScheduleId { get; set; }
        public int? UserId { get; set; }
        public int? FkLab { get; set; }
        public string? TimeIn { get; set; }
        public string? TimeOut { get; set; }
        public int? DayOfWeek { get; set; }
        public int? FkScheduleType { get; set; }
        public string? Location { get; set; } // for school schedule since not every room will be a lab. 
    }
}
