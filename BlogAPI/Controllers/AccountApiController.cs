using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BlogDataLibrary.DataAccess;
using BlogAPI.Models;
using BlogDataLibrary.Security;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using BlogDataLibrary.Models;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BlogAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountApiController : Controller
    {
        private readonly IBlogDbAccessor _db;
        private readonly IConfiguration _config;

        public AccountApiController(IBlogDbAccessor db, IConfiguration configuration)
        {
            _db = db;
            _config = configuration;
        }

        [Route("login")]
        [HttpPost]
        public IActionResult Login([FromBody]LoginModel loginModel)
        {
            string emailAddress = loginModel.EmailAddress;
            string password = loginModel.Password;
            UserModel user = null;
            try
            {
                user = _db.GetAllUsers().Where(u => u.EmailAddress == emailAddress).First();
            } catch (InvalidOperationException error) {
                // todo: maybe do something with the error message.
            }
            if (user != null)
            {
                PasswordHashModel passwordHash = new PasswordHashModel();
                passwordHash.FromDbString(user.PasswordHash);

                (bool IsPasswordCorrect, bool iterationsNeedsUpgrade) = HashAndSalter.PasswordEqualsHash(password, passwordHash);

                if (IsPasswordCorrect)
                {
                    List<Claim> userClaims = new List<Claim>()
                    {
                        new Claim(ClaimTypes.Name, user.Name),
                        new Claim(ClaimTypes.Email, user.EmailAddress),
                        new Claim(ClaimTypes.Role, user.Role),
                        new Claim(JwtRegisteredClaimNames.Nbf, new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString()),
                        new Claim(JwtRegisteredClaimNames.Exp, new DateTimeOffset(DateTime.UtcNow.AddHours(12)).ToUnixTimeSeconds().ToString())
                    }; // TODO: Learn how to refresh a token like every 5 minutes


                    var token = new JwtSecurityToken(
                        new JwtHeader(
                            new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.GetValue<string>("JWTPrivateKey"))),
                                                    SecurityAlgorithms.HmacSha256)),
                        new JwtPayload(userClaims));
                    var handler = new JwtSecurityTokenHandler().WriteToken(token);

                    return new ObjectResult(handler);
                }
                else
                {
                    return BadRequest(new UnauthorizedObjectResult("Invalid password"));
                }
            }
            else
            {
                return BadRequest(new UnauthorizedObjectResult("Invalid email address"));
            }

            return NoContent();
        }

        [Route("logout")]
        [HttpPost]
        public void Logout()
        {
            throw new NotImplementedException("Log out from JWT token?"); // TODO: Either complete or remove this method
        }

        [Authorize(Policy = "IsCommenter")]
        [Route("getLoggedInUser")]
        [HttpGet]
        public UserViewModel GetLoggedInUser()
        {
            // Get logged in user by email
            string email = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.Email).First().Value;
            UserModel user = _db.GetAllUsers().Where(x => x.EmailAddress == email).First();

            UserViewModel userViewModel = new UserViewModel();
            userViewModel.SetThisToDbUserModel(user);

            return userViewModel;
        }

        /// <summary>
        /// Returns whether or not the account was successfully created.
        /// </summary>
        /// <param name="createAccountViewModel"></param>
        /// <returns></returns>
        [Route("createAccount")]
        [HttpPost]
        public bool CreateAccount([FromBody]CreateAccountViewModel createAccountViewModel)
        {
            // 1 Ensure that there are no users with the new email
            var users = _db.GetAllUsers();
            if (users.Any(x => x.EmailAddress == createAccountViewModel.EmailAddress))
            {
                return false;
            }
            // 2 ok that email isn't used so this account can be created
            _db.CreateUser(createAccountViewModel.GetAsDbUserModel(), false);
            return true;
        }

        /// <summary>
        /// Returns whether or not the account was successfully edited.
        /// </summary>
        /// <param name="userViewModel"></param>
        /// <returns></returns>
        [Authorize(Policy = "IsCommenter")]
        [Route("editAccount")]
        [HttpPut]
        public bool EditAccount([FromBody]UserViewModel userViewModel)
        {
            // 1 Ensure that there are no users with the new email
            var users = _db.GetAllUsers();

            string originalEmail = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.Email).First().Value;

            if (users.Any(x => x.EmailAddress == userViewModel.EmailAddress && x.EmailAddress != originalEmail))
            {
                return false;
            }

            // 2 update user data in column with the original email
            UserModel oldDbUser = users.Where(x => x.EmailAddress == originalEmail).First();
            userViewModel.Id = oldDbUser.Id;
            UserModel newDbUser = userViewModel.GetAsDbUserModel();
            newDbUser.Role = oldDbUser.Role;
            _db.UpdateUser(newDbUser);
            return true;
        }

        /// <summary>
        /// Returns whether or not the password was successfully changed to the new value.
        /// </summary>
        /// <param name="editPasswordModel"></param>
        /// <returns></returns>
        [Authorize(Policy = "IsCommenter")]
        [Route("editPassword")]
        [HttpPut]
        public bool EditPassword([FromBody]EditPasswordModel editPasswordModel)
        {
            // 1 Get logged in user by email
            string email = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.Email).First().Value;
            UserModel user = _db.GetAllUsers().Where(x => x.EmailAddress == email).First();

            // 2 Make sure that old password really is the old password
            PasswordHashModel dbPassword = new PasswordHashModel();
            dbPassword.FromDbString(user.PasswordHash);

            (bool isSamePassword, bool needsUpgrade) = HashAndSalter.PasswordEqualsHash(editPasswordModel.OldPassword, dbPassword);
            if (isSamePassword == false)
            {
                return false;
            }

            // 3 if the old password is correct, replace it with the new one
            _db.UpdateUserPassword(user, editPasswordModel.NewPassword);
            return true;
        }

        [Authorize(Policy = "IsCommenter")]
        [Route("deleteAccount")]
        [HttpDelete]
        public bool DeleteAccount()
        {
            //// 1 Get email from token
            //Claim originalEmail = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.Email).First();
            //// 2 Get id of logged in user 
            //var users = _db.GetAllUsers();
            //int userId = users.Where(x => x.EmailAddress == originalEmail.Value).First().Id;
            //// 3 delete user by id
            //_db.DeleteUser(userId);
            throw new NotImplementedException("We don't actually allow our users to delete their accounts as of now.");
        }
    }
}
