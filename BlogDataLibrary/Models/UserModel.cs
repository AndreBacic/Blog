﻿namespace BlogDataLibrary.Models
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

        public string Name => FirstName + " " + LastName;

        public static readonly string ADMIN_ROLE = "Admin";
        public static readonly string COMMENTER_ROLE = "Commenter";
    }
}
