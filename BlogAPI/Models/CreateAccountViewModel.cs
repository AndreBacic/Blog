namespace BlogAPI.Models
{
    public class CreateAccountViewModel
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }
        public string Password { get; set; }
        public bool DoesReceiveNotifications { get; set; }
    }
}
