using System.Text.RegularExpressions;
using Xunit;

namespace BlogDataLibrary.Tests.Controllers
{
    public class PrivateMethodTests
    {
        [Theory]
        [InlineData("", false)]
        [InlineData("1234567890", false)]
        [InlineData("aAbBcCdD", false)]
        [InlineData("aAbB1", false)]
        [InlineData("aAbBc1", true)]
        [InlineData("Admin123", true)]
        [InlineData("User5090", true)]
        [InlineData("2!NaN555877EE", true)]
        public void IsValidPassword_ShouldWork(string password, bool isValid)
        {
            Assert.Equal(isValid, IsValidPassword(password));
        }
        private bool IsValidPassword(string password) // from BlogAPI.Controllers.AccountApiController
        {
            Regex regex = new Regex(@"^((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,})$");

            return regex.IsMatch(password);
        }
    }
}
