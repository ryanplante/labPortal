using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class User
    {
        public User()
        {
            AuditLogs = new HashSet<AuditLog>();
            Bans = new HashSet<Ban>();
            ChatLogs = new HashSet<ChatLog>();
            ErrorLogs = new HashSet<ErrorLog>();
            LogMonitors = new HashSet<Log>();
            LogStudents = new HashSet<Log>();
            ScheduleExemptions = new HashSet<ScheduleExemption>();
            Schedules = new HashSet<Schedule>();
            UserTokens = new HashSet<UserToken>();
        }

        public int UserId { get; set; }
        public string? FName { get; set; }
        public string? LName { get; set; }
        public string? Password { get; set; }
        public int? UserDept { get; set; }
        public int? PrivLvl { get; set; }
        public int? Position { get; set; }
        public bool? IsTeacher { get; set; }
        public DateTime LastUpdated { get; set; }

        public virtual PositionLookup? PositionNavigation { get; set; }
        public virtual PermissionLookup? PrivLvlNavigation { get; set; }
        public virtual Department? UserDeptNavigation { get; set; }
        public virtual ICollection<AuditLog> AuditLogs { get; set; }
        public virtual ICollection<Ban> Bans { get; set; }
        public virtual ICollection<ChatLog> ChatLogs { get; set; }
        public virtual ICollection<ErrorLog> ErrorLogs { get; set; }
        public virtual ICollection<Log> LogMonitors { get; set; }
        public virtual ICollection<Log> LogStudents { get; set; }
        public virtual ICollection<ScheduleExemption> ScheduleExemptions { get; set; }
        public virtual ICollection<Schedule> Schedules { get; set; }
        public virtual ICollection<UserToken> UserTokens { get; set; }
    }
}
