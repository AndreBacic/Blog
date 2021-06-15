using System;
using System.Collections.Generic;
using System.Text;

namespace BlogDataLibrary.Models
{
    public class UserViewModel
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string EmailAddress { get; set; }
        
        public string Name
        {
            get
            {
                return this.FirstName + " " + this.LastName;
            }
        }

        public void SetThisToDbUserModel(UserModel user)
        {
            this.Id = user.Id;
            this.FirstName = user.FirstName;
            this.LastName = user.LastName;
            this.EmailAddress = user.EmailAddress;
        }
        public UserModel GetAsDbUserModel()
        {
            UserModel output = new UserModel {
                Id = this.Id,
                FirstName = this.FirstName,
                LastName = this.LastName,
                EmailAddress = this.EmailAddress
            };
            return output;
        }
    }
}
