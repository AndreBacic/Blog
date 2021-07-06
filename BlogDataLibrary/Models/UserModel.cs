using System;
using System.Collections.Generic;
using System.Text;

namespace BlogDataLibrary.Models
{
    public class UserModel
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }
        public string PasswordHash { get; set; }
        public string Role { get; set; }
        public bool DoesReceiveNotifications { get; set; }

        public string Name
        {
            get
            {
                return this.FirstName + " " + this.LastName;
            }
        }

        public static readonly string ADMIN_ROLE = "Admin";
        public static readonly string COMMENTER_ROLE = "Commenter";
    }
}
