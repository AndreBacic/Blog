using BlogDataLibrary.Models;
using BlogDataLibrary.Security;

namespace BlogAPI.Models
{
    public class CreateAccountViewModel
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }
        public string Password { get; set; }
        public bool DoesReceiveNotifications { get; set; }

        /// <summary>
        /// Hashes self's plaintext password and returns a usermodel with most fields filled out.
        /// Assumes the new account is for a commenter.
        /// </summary>
        /// <returns></returns>
        public UserModel GetAsDbUserModel()
        {
            string dbPasswordHash = HashAndSalter.HashAndSalt(this.Password).ToDbString();
            UserModel output = new UserModel
            {
                FirstName = this.FirstName,
                LastName = this.LastName,
                EmailAddress = this.EmailAddress,
                PasswordHash = dbPasswordHash,
                Role = UserModel.COMMENTER_ROLE,
                DoesReceiveNotifications = this.DoesReceiveNotifications
            };
            return output;
        }
    }
}
