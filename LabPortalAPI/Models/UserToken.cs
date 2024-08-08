using System;
using System.Collections.Generic;

namespace LabPortal.Models
{
    public partial class UserToken
    {
        public Guid TokenId { get; set; }
        public int? FkUserId { get; set; }
        public string? Token { get; set; }
        public DateTime? Expiration { get; set; }

        public virtual User? FkUser { get; set; }
    }
}
