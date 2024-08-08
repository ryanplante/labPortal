namespace LabPortal.Models.Dto
{
    public class UserDto
    {
        public int UserId { get; set; }
        public string? FName { get; set; }
        public string? LName { get; set; }
        public int? UserDept { get; set; }
        public int? PrivLvl { get; set; }
        public int? Position { get; set; }
        public bool? IsTeacher { get; set; }
    }
}
