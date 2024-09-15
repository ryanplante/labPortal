namespace LabPortal.Models.Dto
{
    public class UpdatePermissionDto
    {
        public int UserId { get; set; }
        public int PermissionLevel { get; set; }  // The new permission level to set
    }
}
