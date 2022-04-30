using System;

namespace BlogDataLibrary.Models
{
    public class RefreshTokenModel
    {
        public int Id { get; set; }
        public string Token { get; set; }
        public DateTime Created { get; set; }
        public string CreatedByIp { get; set; }
        public DateTime Expires { get; set; }
        public int OwnerId { get; set; }
    }
}
