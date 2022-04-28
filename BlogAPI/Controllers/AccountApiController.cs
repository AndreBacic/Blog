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
            
            UserModel user = _db.GetUser(emailAddress);
            if (user == null || user.Id <= 0)
            {
                return BadRequest("Invalid email address");
            }
            
            PasswordHashModel passwordHash = new PasswordHashModel();
            passwordHash.FromDbString(user.PasswordHash);

            (bool IsPasswordCorrect, _) = HashAndSalter.PasswordEqualsHash(password, passwordHash);

            if (IsPasswordCorrect == false)
            {
                return BadRequest("Invalid password");
            }
            
            string handler = TokenService.GenerateJwtToken(
                                        GenerateUserClaimsList(user),
                                        _config.GetValue<string>("JWTPrivateKey"));

            RefreshTheRefreshToken(user.Id);

            return Ok(handler);                      
        }

        [Route("logout")]
        [HttpPost]
        public IActionResult Logout()
        {
            if (HttpContext.User.Identity.IsAuthenticated)
            {
                int userId;
                try
                {
                    userId = GetLoggedInDbUserByEmail().Id;
                }
                catch (Exception) // This happens if someone changes their email and then sends an obsolete but not expired jwt to this endpoint
                {
                    return StatusCode(StatusCodes.Status401Unauthorized);
                }
                RevokeUsersOldRefreshTokens(userId);
                return StatusCode(StatusCodes.Status200OK);
            }
            return StatusCode(StatusCodes.Status401Unauthorized);
        }

        [Route("refreshToken")]
        [HttpPost]
        public IActionResult RefreshToken()
        {
            // HACK: get refresh token from SQL SP
            string oldCookieRefreshToken = Request.Cookies["refreshToken"];
            RefreshTokenModel oldDbRefreshToken = _db.GetRefreshToken(oldCookieRefreshToken);
            
            if (oldDbRefreshToken == null || 
                DateTime.Compare(oldDbRefreshToken.Expires, DateTime.UtcNow) < 0)
            {
                return Unauthorized("No valid refresh token. Please login again.");
            }
            UserModel user = _db.GetUser(oldDbRefreshToken.OwnerId);

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
            UserModel user;
            try
            {
                user = GetLoggedInDbUserByEmail();
            }
            catch (Exception) // This happens if someone changes their email and then sends an obsolete but not expired jwt to this endpoint
            {
                return StatusCode(StatusCodes.Status401Unauthorized);
            }
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
            UserModel user = _db.GetUser(createAccountViewModel.EmailAddress);
            if (user != null || user?.Id > 0 ||
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
                       
            UserModel loggedInUser = GetLoggedInDbUserByEmail();
            UserModel user = _db.GetUser(userViewModel.EmailAddress);

            if (user != null && user.Id != loggedInUser.Id)
            {
                return StatusCode(StatusCodes.Status422UnprocessableEntity);
            }

            // 3 update user data in column with the original email
            userViewModel.Id = loggedInUser.Id;
            UserModel newDbUser = userViewModel.GetAsDbUserModel();
            newDbUser.Role = loggedInUser.Role;
            _db.UpdateUser(newDbUser);

            RefreshTheRefreshToken(newDbUser.Id);

            string jwt = TokenService.GenerateJwtToken(
                                    GenerateUserClaimsList(newDbUser),
                                    _config.GetValue<string>("JWTPrivateKey"));
            return StatusCode(StatusCodes.Status201Created, jwt);
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
            UserModel user;
            try
            {
                user = GetLoggedInDbUserByEmail();
            }
            catch (Exception) // This happens if someone changes their email and then sends an obsolete but not expired jwt to this endpoint
            {
                return StatusCode(StatusCodes.Status401Unauthorized);
            }

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
            int userId;
            try
            {
                userId = GetLoggedInDbUserByEmail().Id;
            }
            catch (Exception) // This happens if someone changes their email and then sends an obsolete but not expired jwt to this endpoint
            {
                return StatusCode(StatusCodes.Status401Unauthorized);
            }
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
            // HACK: move this to SQL SP (delete all refresh tokens for user, param userId) and remove these two excess SPs

            _db.DeleteRefreshTokensByUserId(userId);
        }

        private UserModel GetLoggedInDbUserByEmail()
        {
            string email = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.Email).First().Value;
            return _db.GetUser(email);
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
