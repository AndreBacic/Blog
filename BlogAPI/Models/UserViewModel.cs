namespace BlogAPI.Models
{
    public class UserViewModel
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }
        public bool DoesReceiveNotifications { get; set; }

        public string Name => FirstName + " " + LastName;
    }
}
