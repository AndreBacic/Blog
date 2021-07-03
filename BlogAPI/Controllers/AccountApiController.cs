using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BlogDataLibrary.DataAccess;
using BlogDataLibrary.Security;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

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
            string emailAddress = loginModel.emailAddress;
            string password = loginModel.password;
            var user = _db.GetAllUsers().Where(u => u.EmailAddress == emailAddress).First();
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
        public async Task<IActionResult> Logout()
        {
            var s = HttpContext.User.Identity.IsAuthenticated;
            var somethinElse = HttpContext.Response.Cookies;
            var somethingElse = HttpContext.Request.Cookies;
            
            await HttpContext.SignOutAsync();
            return NoContent();
        }
    }
    public class LoginModel
    {
        public string emailAddress { get; set; }
        public string password { get; set; }
    }
}
