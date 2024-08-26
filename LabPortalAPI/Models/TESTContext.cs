using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace LabPortal.Models
{
    public partial class TESTContext : DbContext
    {
        public TESTContext()
        {
        }

        public TESTContext(DbContextOptions<TESTContext> options)
            : base(options)
        {
        }

        public virtual DbSet<AuditLog> AuditLogs { get; set; } = null!;
        public virtual DbSet<AuditLogType> AuditLogTypes { get; set; } = null!;
        public virtual DbSet<Ban> Bans { get; set; } = null!;
        public virtual DbSet<ChatLog> ChatLogs { get; set; } = null!;
        public virtual DbSet<Department> Departments { get; set; } = null!;
        public virtual DbSet<ErrorLog> ErrorLogs { get; set; } = null!;
        public virtual DbSet<ErrorLogTypeLookup> ErrorLogTypeLookups { get; set; } = null!;
        public virtual DbSet<Item> Items { get; set; } = null!;
        public virtual DbSet<Lab> Labs { get; set; } = null!;
        public virtual DbSet<Log> Logs { get; set; } = null!;
        public virtual DbSet<LogSummary> LogSummaries { get; set; } = null!;
        public virtual DbSet<PermissionLookup> PermissionLookups { get; set; } = null!;
        public virtual DbSet<PositionLookup> PositionLookups { get; set; } = null!;
        public virtual DbSet<Schedule> Schedules { get; set; } = null!;
        public virtual DbSet<TransactionTypeLookup> TransactionTypeLookups { get; set; } = null!;
        public virtual DbSet<User> Users { get; set; } = null!;
        public virtual DbSet<UserToken> UserTokens { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.HasKey(e => e.LogId)
                    .HasName("PK__AuditLog__7839F62D49B4C980");

                entity.Property(e => e.LogId).HasColumnName("logID");

                entity.Property(e => e.Description)
                    .HasMaxLength(255)
                    .HasColumnName("description");

                entity.Property(e => e.Timestamp)
                    .HasColumnType("datetime")
                    .HasColumnName("timestamp");

                entity.Property(e => e.UserId).HasColumnName("userID");

                entity.HasOne(d => d.AuditLogType)
                    .WithMany(p => p.AuditLogs)
                    .HasForeignKey(d => d.AuditLogTypeId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_AuditLogs_AuditLogType");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.AuditLogs)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_AuditLogs_Users");
            });

            modelBuilder.Entity<AuditLogType>(entity =>
            {
                entity.ToTable("AuditLogType");

                entity.Property(e => e.Name).HasMaxLength(50);
            });

            modelBuilder.Entity<Ban>(entity =>
            {
                entity.Property(e => e.BanId).HasColumnName("banID");

                entity.Property(e => e.ExpirationDate)
                    .HasColumnType("datetime")
                    .HasColumnName("expirationDate");

                entity.Property(e => e.Reason)
                    .HasMaxLength(150)
                    .HasColumnName("reason");

                entity.Property(e => e.UserId).HasColumnName("userID");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Bans)
                    .HasForeignKey(d => d.UserId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK__Bans__userID__5812160E");
            });

            modelBuilder.Entity<ChatLog>(entity =>
            {
                entity.HasKey(e => e.LogId)
                    .HasName("PK__ChatLogs__7839F62DEB098DAD");

                entity.Property(e => e.LogId).HasColumnName("logID");

                entity.Property(e => e.Message)
                    .HasMaxLength(255)
                    .HasColumnName("message");

                entity.Property(e => e.Timestamp)
                    .HasColumnType("datetime")
                    .HasColumnName("timestamp");

                entity.Property(e => e.UserId).HasColumnName("userID");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.ChatLogs)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__ChatLogs__userID__5AEE82B9");
            });

            modelBuilder.Entity<Department>(entity =>
            {
                entity.HasKey(e => e.DeptId)
                    .HasName("PK__Departme__BE2D26D6D4B52876");

                entity.Property(e => e.DeptId).HasColumnName("deptID");

                entity.Property(e => e.Name)
                    .HasMaxLength(30)
                    .HasColumnName("name");
            });

            modelBuilder.Entity<ErrorLog>(entity =>
            {
                entity.HasKey(e => e.LogId)
                    .HasName("PK__ErrorLog__7839F62D8BADAB2E");

                entity.Property(e => e.LogId).HasColumnName("logID");

                entity.Property(e => e.Description).HasColumnName("description");

                entity.Property(e => e.LogType).HasColumnName("logType");

                entity.Property(e => e.Platform)
                    .HasMaxLength(50)
                    .HasColumnName("platform");

                entity.Property(e => e.Source).HasColumnName("source");

                entity.Property(e => e.Stack).HasColumnName("stack");

                entity.Property(e => e.Timestamp)
                    .HasColumnType("datetime")
                    .HasColumnName("timestamp");

                entity.Property(e => e.UserId).HasColumnName("userID");

                entity.Property(e => e.Version)
                    .HasMaxLength(20)
                    .HasColumnName("version");

                entity.HasOne(d => d.LogTypeNavigation)
                    .WithMany(p => p.ErrorLogs)
                    .HasForeignKey(d => d.LogType)
                    .HasConstraintName("FK__ErrorLogs__logTy__5DCAEF64");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.ErrorLogs)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__ErrorLogs__userI__5EBF139D");
            });

            modelBuilder.Entity<ErrorLogTypeLookup>(entity =>
            {
                entity.HasKey(e => e.TypeId)
                    .HasName("PK__ErrorLog__F04DF11AAD6F543E");

                entity.ToTable("ErrorLogTypeLookup");

                entity.Property(e => e.TypeId)
                    .ValueGeneratedNever()
                    .HasColumnName("typeID");

                entity.Property(e => e.TypeName)
                    .HasMaxLength(20)
                    .HasColumnName("typeName");
            });

            modelBuilder.Entity<Item>(entity =>
            {
                entity.Property(e => e.ItemId)
                    .ValueGeneratedOnAdd()
                    .HasColumnName("itemID");

                entity.Property(e => e.Description)
                    .HasMaxLength(30)
                    .HasColumnName("description");

                entity.Property(e => e.FkLab).HasColumnName("fk_lab");

                entity.Property(e => e.Picture).HasColumnName("picture");

                entity.Property(e => e.Quantity).HasColumnName("quantity");

                entity.Property(e => e.SerialNum)
                    .HasMaxLength(30)
                    .HasColumnName("serialNum");

                entity.HasOne(d => d.FkLabNavigation)
                    .WithMany(p => p.Items)
                    .HasForeignKey(d => d.FkLab)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Items_Lab");
            });

            modelBuilder.Entity<Lab>(entity =>
            {
                entity.Property(e => e.LabId).HasColumnName("labID");

                entity.Property(e => e.DeptId).HasColumnName("deptID");

                entity.Property(e => e.Name)
                    .HasMaxLength(25)
                    .HasColumnName("name");

                entity.Property(e => e.RoomNum)
                    .HasMaxLength(5)
                    .HasColumnName("roomNum");

                entity.HasOne(d => d.Dept)
                    .WithMany(p => p.Labs)
                    .HasForeignKey(d => d.DeptId)
                    .HasConstraintName("FK__Labs__deptID__6A30C649");
            });

            modelBuilder.Entity<Log>(entity =>
            {
                entity.Property(e => e.LogId).HasColumnName("logID");

                entity.Property(e => e.FkLog).HasColumnName("fk_log");

                entity.Property(e => e.LabId).HasColumnName("labID");

                entity.Property(e => e.MonitorId).HasColumnName("monitorID");

                entity.Property(e => e.StudentId).HasColumnName("studentID");

                entity.Property(e => e.Timestamp)
                    .HasColumnType("datetime")
                    .HasColumnName("timestamp");

                entity.Property(e => e.TransactionType).HasColumnName("transactionType");

                entity.HasOne(d => d.Item)
                    .WithMany(p => p.Logs)
                    .HasForeignKey(d => d.ItemId)
                    .HasConstraintName("FK_Log_Items");

                entity.HasOne(d => d.Lab)
                    .WithMany(p => p.Logs)
                    .HasForeignKey(d => d.LabId)
                    .HasConstraintName("FK__Logs__labID__6E01572D");

                entity.HasOne(d => d.Monitor)
                    .WithMany(p => p.LogMonitors)
                    .HasForeignKey(d => d.MonitorId)
                    .HasConstraintName("FK_Logs_MonitorID");

                entity.HasOne(d => d.Student)
                    .WithMany(p => p.LogStudents)
                    .HasForeignKey(d => d.StudentId)
                    .HasConstraintName("FK__Logs__studentID__6D0D32F4");

                entity.HasOne(d => d.TransactionTypeNavigation)
                    .WithMany(p => p.Logs)
                    .HasForeignKey(d => d.TransactionType)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Logs_TransactionType");
            });

            modelBuilder.Entity<LogSummary>(entity =>
            {
                entity.HasKey(e => e.SummaryId);

                entity.ToTable("LogSummary");

                entity.Property(e => e.SummaryId).HasColumnName("SummaryID");

                entity.Property(e => e.CheckInTime).HasColumnType("datetime");

                entity.Property(e => e.CheckOutTime).HasColumnType("datetime");

                entity.Property(e => e.LastUpdateTime).HasColumnType("datetime");

                entity.HasOne(d => d.Item)
                    .WithMany(p => p.LogSummaries)
                    .HasForeignKey(d => d.ItemId)
                    .HasConstraintName("FK_LogSummary_Items");
            });

            modelBuilder.Entity<PermissionLookup>(entity =>
            {
                entity.HasKey(e => e.UserLevel)
                    .HasName("PK__Permissi__4DEFD3830EC6F883");

                entity.ToTable("PermissionLookup");

                entity.Property(e => e.UserLevel)
                    .ValueGeneratedNever()
                    .HasColumnName("userLevel");

                entity.Property(e => e.Name)
                    .HasMaxLength(10)
                    .HasColumnName("name");
            });

            modelBuilder.Entity<PositionLookup>(entity =>
            {
                entity.HasKey(e => e.PositionId)
                    .HasName("PK__Position__B07CF58E42BFD936");

                entity.ToTable("PositionLookup");

                entity.Property(e => e.PositionId)
                    .ValueGeneratedNever()
                    .HasColumnName("positionID");

                entity.Property(e => e.Details)
                    .HasMaxLength(13)
                    .HasColumnName("details");
            });

            modelBuilder.Entity<Schedule>(entity =>
            {
                entity.Property(e => e.ScheduleId).HasColumnName("scheduleID");

                entity.Property(e => e.DayOfWeek).HasColumnName("dayOfWeek");

                entity.Property(e => e.FkLab).HasColumnName("fk_lab");

                entity.Property(e => e.Location).HasColumnName("location");

                entity.Property(e => e.TimeIn)
                    .HasMaxLength(5)
                    .HasColumnName("timeIn");

                entity.Property(e => e.TimeOut)
                    .HasMaxLength(5)
                    .HasColumnName("timeOut");

                entity.Property(e => e.UserId).HasColumnName("userID");


                entity.HasOne(d => d.LocationNavigation)
                    .WithMany(p => p.Schedules)
                    .HasForeignKey(d => d.Location)
                    .HasConstraintName("FK__Schedules__locat__72C60C4A");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Schedules)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__Schedules__userI__70DDC3D8");
            });


            modelBuilder.Entity<TransactionTypeLookup>(entity =>
            {
                entity.HasKey(e => e.TypeId)
                    .HasName("PK__Transact__F04DF11A024F2E24");

                entity.ToTable("TransactionTypeLookup");

                entity.Property(e => e.TypeId)
                    .ValueGeneratedNever()
                    .HasColumnName("typeID");

                entity.Property(e => e.TypeName)
                    .HasMaxLength(20)
                    .HasColumnName("typeName");
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.UserId)
                    .ValueGeneratedNever()
                    .HasColumnName("userID");

                entity.Property(e => e.FName)
                    .HasMaxLength(32)
                    .HasColumnName("fName");

                entity.Property(e => e.IsTeacher).HasColumnName("isTeacher");

                entity.Property(e => e.LName)
                    .HasMaxLength(32)
                    .HasColumnName("lName");

                entity.Property(e => e.LastUpdated).HasColumnName("lastUpdated");

                entity.Property(e => e.Password)
                    .HasMaxLength(255)
                    .HasColumnName("password");

                entity.Property(e => e.Position).HasColumnName("position");

                entity.Property(e => e.PrivLvl).HasColumnName("privLvl");

                entity.Property(e => e.UserDept).HasColumnName("userDept");

                entity.HasOne(d => d.PositionNavigation)
                    .WithMany(p => p.Users)
                    .HasForeignKey(d => d.Position)
                    .HasConstraintName("FK__Users__position__5535A963");

                entity.HasOne(d => d.PrivLvlNavigation)
                    .WithMany(p => p.Users)
                    .HasForeignKey(d => d.PrivLvl)
                    .HasConstraintName("FK__Users__privLvl__5441852A");

                entity.HasOne(d => d.UserDeptNavigation)
                    .WithMany(p => p.Users)
                    .HasForeignKey(d => d.UserDept)
                    .HasConstraintName("FK__Users__userDept__534D60F1");
            });

            modelBuilder.Entity<UserToken>(entity =>
            {
                entity.HasKey(e => e.TokenId)
                    .HasName("PK__UserToke__658FEEEACD69E905");

                entity.Property(e => e.TokenId).ValueGeneratedNever();

                entity.Property(e => e.Expiration).HasColumnType("datetime");

                entity.Property(e => e.FkUserId).HasColumnName("FK_UserID");

                entity.HasOne(d => d.FkUser)
                    .WithMany(p => p.UserTokens)
                    .HasForeignKey(d => d.FkUserId)
                    .HasConstraintName("FK__UserToken__FK_Us__160F4887");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
