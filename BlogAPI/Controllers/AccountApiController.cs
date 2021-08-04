﻿using BlogAPI.Models;
using BlogDataLibrary.DataAccess;
using BlogDataLibrary.Models;
using BlogDataLibrary.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

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
            }
            catch (InvalidOperationException error)
            {
                // todo: maybe do something with the error message.
            }
            if (user != null)
            {
                PasswordHashModel passwordHash = new PasswordHashModel();
                passwordHash.FromDbString(user.PasswordHash);

                (bool IsPasswordCorrect, _) = HashAndSalter.PasswordEqualsHash(password, passwordHash);

                if (IsPasswordCorrect)
                {
                    List<Claim> userClaims = new List<Claim>()
                    {
                        new Claim(ClaimTypes.Name, user.Name),
                        new Claim(ClaimTypes.Email, user.EmailAddress),
                        new Claim(ClaimTypes.Role, user.Role),
                    };
                    
                    string handler = TokenService.GenerateJwtToken(userClaims, 
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
            RevokeUsersOldRefreshTokens(GetLoggedInDbUserByEmail().Id);
            return StatusCode(StatusCodes.Status204NoContent);
        }

        [Route("refresh-token")]
        [HttpPost]
        public IActionResult RefreshToken()
        {
            var user = GetLoggedInDbUserByEmail();

            List<RefreshTokenModel> refreshTokens = _db.GetRefreshTokensByUserId(user.Id);
            string refreshToken = Request.Cookies["refreshToken"];

            if (!refreshTokens.Any(x => DateTime.Compare(x.Expires, DateTime.UtcNow) <= 0 &&
                                        String.Equals(x.Token, refreshToken)))
            {
                RevokeUsersOldRefreshTokens(user.Id);
                return Unauthorized("No valid refresh token. Please login again.");
            }

            // There is a valid refresh token in the db; perform operations
            RefreshTheRefreshToken(user.Id);

            var jwt = TokenService.GenerateJwtToken(User.Claims.ToList(),
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
        [HttpPost] // TODO: Refactor APIs to return IActionResult http codes instead of booleans
        public bool CreateAccount([FromBody]CreateAccountViewModel createAccountViewModel)
        {
            // 1 Check that email is a valid email
            if (IsValidEmailAddress(createAccountViewModel.EmailAddress) == false)
            {
                return false;
            }
            // 2 Ensure that there are no users with the new email
            List<UserModel> users = _db.GetAllUsers();
            if (users.Any(x => x.EmailAddress == createAccountViewModel.EmailAddress))
            {
                return false;
            }
            // 3 ok that email isn't used so this account can be created
            _db.CreateUser(createAccountViewModel.GetAsDbUserModel(), false);
            return true;
        }
        private bool IsValidEmailAddress(string emailAddress) // todo: move this method to an emailing class once there are more emailing methods.
        {
            try
            {
                MailAddress m = new MailAddress(emailAddress);
                return true;
            }
            catch (FormatException)
            {
                return false;
            }
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
            // 1 Ensure email is valid
            if (IsValidEmailAddress(userViewModel.EmailAddress) == false)
            {
                return false;
            }
            // 2 Ensure that there are no users with the new email
            List<UserModel> users = _db.GetAllUsers();

            string originalEmail = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.Email).First().Value;

            if (users.Any(x => x.EmailAddress == userViewModel.EmailAddress && x.EmailAddress != originalEmail))
            {
                return false;
            }

            // 3 update user data in column with the original email
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
            UserModel user = GetLoggedInDbUserByEmail();

            // 2 Make sure that old password really is the old password
            PasswordHashModel dbPassword = new PasswordHashModel();
            dbPassword.FromDbString(user.PasswordHash);

            // todo: validate password with regex

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
            return false; // We don't actually allow our users to delete their accounts as of now.
        }

        private void RefreshTheRefreshToken(int userId)
        {
            RevokeUsersOldRefreshTokens(userId);

            var refreshToken = TokenService.GenerateRefreshToken(userId, this.IpAddress());
            _db.CreateRefreshToken(refreshToken);

            setTokenCookie(refreshToken.Token);
        }

        private void RevokeUsersOldRefreshTokens(int userId)
        {
            var existingTokens = _db.GetRefreshTokensByUserId(userId);
            foreach (var token in existingTokens)
            {
                _db.DeleteRefreshToken(token.Id);
            }
        }

        private UserModel GetLoggedInDbUserByEmail()
        {
            string email = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.Email).First().Value;
            return _db.GetAllUsers().Where(x => x.EmailAddress == email).First();
        }

        private void setTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("refreshToken", token, cookieOptions);
        }

        private string IpAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return Request.Headers["X-Forwarded-For"];
            else
                return HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
        }
    }
}
