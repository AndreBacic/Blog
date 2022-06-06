using Autofac.Extras.Moq;
using BlogAPI.Controllers;
using BlogDataLibrary.DataAccess;
using Xunit;

namespace BlogDataLibrary.Tests.Controllers
{
    public class AccountApiTests
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
            using (AutoMock mock = AutoMock.GetLoose())
            {
                mock.Mock<IBlogDbAccessor>()
                    .Setup(x => x.GetAllArticles())
                    .Returns(ApiSampleData.GetSampleArticles());

                AccountApiController ctrl = mock.Create<AccountApiController>();
                Assert.Equal(isValid, ctrl.IsValidPassword(password));
            }
        }
    }
}
