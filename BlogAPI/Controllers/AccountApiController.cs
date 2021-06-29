using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using BlogDataLibrary.DataAccess;
using BlogDataLibrary.Security;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BlogAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountApiController : Controller
    {
        private readonly IBlogDbAccessor _db;

        public AccountApiController(IBlogDbAccessor db)
        {
            _db = db;
        }

        [HttpPost("{emailAddress}/{password}")]
        public async Task<IActionResult> Login(string emailAddress, string password)
        {
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
                        new Claim(ClaimTypes.Role, user.Role)
                    };

                    List<ClaimsIdentity> claimsIdentities = new List<ClaimsIdentity>()
                    {
                        new ClaimsIdentity(userClaims)
                    };

                    ClaimsPrincipal multiClaimIdentityContainer = new ClaimsPrincipal(claimsIdentities);

                    await Request.HttpContext.SignInAsync("BlogAuth", multiClaimIdentityContainer);
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

        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync();
            return NoContent();
        }
    }
}
