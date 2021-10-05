using BlogAPI.Models;
using BlogDataLibrary.DataAccess;
using BlogDataLibrary.Messaging;
using BlogDataLibrary.Models;
using BlogDataLibrary.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace BlogAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountApiController : Controller
    {
        private readonly IBlogDbAccessor _db;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        public AccountApiController(IBlogDbAccessor db,
                                    IConfiguration configuration,
                                    IEmailService emailService)
        {
            _db = db;
            _config = configuration;
            _emailService = emailService;
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
            }
            catch (InvalidOperationException)
            {
                return BadRequest(new UnauthorizedObjectResult("Invalid email address"));
            }
            if (user != null)
            {
                PasswordHashModel passwordHash = new PasswordHashModel();
                passwordHash.FromDbString(user.PasswordHash);

                (bool IsPasswordCorrect, _) = HashAndSalter.PasswordEqualsHash(password, passwordHash);

                if (IsPasswordCorrect)
                {
                    string handler = TokenService.GenerateJwtToken(
                                                GenerateUserClaimsList(user),
                                                _config.GetValue<string>("JWTPrivateKey"));

                    RefreshTheRefreshToken(user.Id);

                    return Ok(handler);
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
        }

        [Route("logout")]
        [HttpPost]
        public IActionResult Logout()
        {
            if (HttpContext.User.Identity.IsAuthenticated)
            {
                RevokeUsersOldRefreshTokens(GetLoggedInDbUserByEmail().Id);
                return StatusCode(StatusCodes.Status200OK);
            }
            return StatusCode(StatusCodes.Status401Unauthorized);
        }

        [Route("refreshToken")]
        [HttpPost]
        public IActionResult RefreshToken()
        {
            List<RefreshTokenModel> refreshTokens = _db.GetAllRefreshTokens();
            string oldCookieRefreshToken = Request.Cookies["refreshToken"];
            RefreshTokenModel oldDbRefreshToken = null;
            try
            {
                oldDbRefreshToken = refreshTokens.First(x => x.Token == oldCookieRefreshToken);
            }
            catch
            {
                return Unauthorized("No valid refresh token. Please login again.");
            }
            UserModel user = _db.GetUser(oldDbRefreshToken.OwnerId);

            if (DateTime.Compare(oldDbRefreshToken.Expires, DateTime.UtcNow) < 0)
            {
                // Refresh token has expired or user is not logged in.
                return Unauthorized("No valid refresh token. Please login again.");
            }

            // There is a valid refresh token in the db; perform operations
            RefreshTheRefreshToken(user.Id);

            string jwt = TokenService.GenerateJwtToken(
                                    GenerateUserClaimsList(user),
                                    _config.GetValue<string>("JWTPrivateKey"));

            return StatusCode(StatusCodes.Status201Created, jwt);
        }

        [Authorize(Policy = "IsCommenter")]
        [Route("getLoggedInUser")]
        [HttpGet]
        public IActionResult GetLoggedInUser()
        {
            // Get logged in user by email
            UserModel user = GetLoggedInDbUserByEmail();

            UserViewModel userViewModel = new UserViewModel();
            userViewModel.SetThisToDbUserModel(user);

            return StatusCode(StatusCodes.Status200OK, userViewModel);
        }

        /// <summary>
        /// Returns whether or not the account was successfully created.
        /// </summary>
        /// <param name="createAccountViewModel"></param>
        /// <returns></returns>
        [Route("createAccount")]
        [HttpPost]
        public IActionResult CreateAccount([FromBody]CreateAccountViewModel createAccountViewModel)
        {
            // 1 Check that email is a valid email
            if (_emailService.IsValidEmailAddress(createAccountViewModel.EmailAddress) == false)
            {
                return StatusCode(StatusCodes.Status401Unauthorized);
            }
            // 2 Ensure that there are no users with the new email and that the password is ok.
            List<UserModel> users = _db.GetAllUsers();
            if (users.Any(x => x.EmailAddress == createAccountViewModel.EmailAddress) ||
                IsValidPassword(createAccountViewModel.Password) == false)
            {
                return StatusCode(StatusCodes.Status422UnprocessableEntity);
            }
            // 3 ok that email isn't used so this account can be created
            _db.CreateUser(createAccountViewModel.GetAsDbUserModel(), false);
            return StatusCode(StatusCodes.Status200OK);
        }

        /// <summary>
        /// Returns whether or not the account was successfully edited.
        /// </summary>
        /// <param name="userViewModel"></param>
        /// <returns></returns>
        [Authorize(Policy = "IsCommenter")]
        [Route("editAccount")]
        [HttpPut]
        public IActionResult EditAccount([FromBody]UserViewModel userViewModel)
        {
            // 1 Ensure email is valid
            if (_emailService.IsValidEmailAddress(userViewModel.EmailAddress) == false)
            {
                return StatusCode(StatusCodes.Status401Unauthorized);
            }
            // 2 Ensure that there are no users with the new email
            List<UserModel> users = _db.GetAllUsers();

            string originalEmail = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.Email).First().Value;

            if (users.Any(x => x.EmailAddress == userViewModel.EmailAddress && x.EmailAddress != originalEmail))
            {
                return StatusCode(StatusCodes.Status400BadRequest);
            }

            // 3 update user data in column with the original email
            UserModel oldDbUser = users.Where(x => x.EmailAddress == originalEmail).First();
            userViewModel.Id = oldDbUser.Id;
            UserModel newDbUser = userViewModel.GetAsDbUserModel();
            newDbUser.Role = oldDbUser.Role;
            _db.UpdateUser(newDbUser);
            return StatusCode(StatusCodes.Status200OK);
        }

        /// <summary>
        /// Returns whether or not the password was successfully changed to the new value.
        /// </summary>
        /// <param name="editPasswordModel"></param>
        /// <returns></returns>
        [Authorize(Policy = "IsCommenter")]
        [Route("editPassword")]
        [HttpPut]
        public IActionResult EditPassword([FromBody]EditPasswordModel editPasswordModel)
        {
            // 1 Validate model
            if (IsValidPassword(editPasswordModel.NewPassword) == false)
            {
                return StatusCode(StatusCodes.Status422UnprocessableEntity);
            }

            // 2 Get logged in user by email
            UserModel user = GetLoggedInDbUserByEmail();

            // 3 Make sure that old password really is the old password
            PasswordHashModel dbPassword = new PasswordHashModel();
            dbPassword.FromDbString(user.PasswordHash);

            (bool isSamePassword, _) = HashAndSalter.PasswordEqualsHash(editPasswordModel.OldPassword, dbPassword);
            if (isSamePassword == false)
            {
                return StatusCode(StatusCodes.Status401Unauthorized);
            }

            // 4 if the old password is correct, replace it with the new one
            _db.UpdateUserPassword(user, editPasswordModel.NewPassword);
            return StatusCode(StatusCodes.Status200OK);
        }

        [Authorize(Policy = "IsCommenter")]
        [Route("deleteAccount")]
        [HttpDelete]
        public IActionResult DeleteAccount()
        {
            int userId = GetLoggedInDbUserByEmail().Id;
            RevokeUsersOldRefreshTokens(userId);
            _db.DeleteUser(userId);
            return StatusCode(StatusCodes.Status200OK);
        }


        // Private helper methods //////////////////////////////////////////////
        private void RefreshTheRefreshToken(int userId)
        {
            RevokeUsersOldRefreshTokens(userId);

            RefreshTokenModel refreshToken = TokenService.GenerateRefreshToken(userId, this.IpAddress());
            _db.CreateRefreshToken(refreshToken);

            SetTokenCookie(refreshToken.Token);
        }

        private void RevokeUsersOldRefreshTokens(int userId)
        {
            List<RefreshTokenModel> existingTokens = _db.GetRefreshTokensByUserId(userId);
            foreach (RefreshTokenModel token in existingTokens)
            {
                _db.DeleteRefreshToken(token.Id);
            }
        }

        private UserModel GetLoggedInDbUserByEmail()
        {
            string email = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.Email).First().Value;
            return _db.GetAllUsers().Where(x => x.EmailAddress == email).First();
        }

        private void SetTokenCookie(string token)
        {
            CookieOptions cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("refreshToken", token, cookieOptions);
        }

        private List<Claim> GenerateUserClaimsList(UserModel user)
        {
            return new List<Claim>()
                {
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Email, user.EmailAddress),
                    new Claim(ClaimTypes.Role, user.Role),
                };
        }

        private string IpAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
            {
                return Request.Headers["X-Forwarded-For"];
            }
            else
            {
                return HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
            }
        }

        private bool IsValidPassword(string password)
        {
            Regex regex = new Regex(@"^((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,})$");

            return regex.IsMatch(password);
        }
    }
}
