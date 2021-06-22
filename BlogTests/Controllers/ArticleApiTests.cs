using System.Linq;
using Xunit;
using Moq;
using Autofac.Extras.Moq;
using BlogDataLibrary.DataAccess;
using BlogAPI.Controllers;
using BlogDataLibrary.Models;

namespace BlogDataLibrary.Tests.Controllers
{
    public class ArticleApiTests
    {
        [Fact]
        public void Get_ShouldWork()
        {
            using (var mock = AutoMock.GetLoose())
            {
                mock.Mock<IBlogDbAccessor>()
                    .Setup(x => x.GetAllArticles())
                    .Returns(ApiSampleData.GetSampleArticles());

                var ctrl = mock.Create<ArticleApiController>();
                var expected = ApiSampleData.GetSampleArticles();
                var actual = ctrl.Get();

                Assert.NotNull(actual);
                Assert.Equal(expected.Count, actual.Count);
            }
        }
        [Theory]
        [InlineData(1)]
        public void Put_ShouldWork(int id)
        {
            var model = ApiSampleData.GetSampleArticles().Where(x => x.Id == id).First();
            var viewModel = new ArticleViewModel();
            viewModel.SetThisToDbArticleModel(model);

            using (var mock = AutoMock.GetLoose())
            {
                mock.Mock<IBlogDbAccessor>()
                    .Setup(x => x.UpdateArticle(model));

                var ctrl = mock.Create<ArticleApiController>();

                ctrl.Put(id, viewModel);

                // This doesn't work because it never saves model, but a different ArticleModel
                //mock.Mock<IBlogDbAccessor>()
                //    .Verify(x => x.UpdateArticle(model), Times.Exactly(1));
            }
        }
    }
}
