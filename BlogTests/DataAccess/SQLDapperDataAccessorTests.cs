using BlogDataLibrary.DataAccess;
using BlogDataLibrary.Models;
using BlogDataLibrary.Tests.Controllers;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace BlogDataLibrary.Tests.DataAccess
{
    public class SQLDapperDataAccessorTests
    {
        [Fact(Skip = "Data Access test should only be run locally")]
        public void UpdateUserPassword_ShouldWork()
        {
            SQLDapperDataAccessor db = new SQLDapperDataAccessor("Server=.;Database=Blog;Trusted_Connection=True;");
            UserModel user = db.GetUser(1);
            db.UpdateUserPassword(user, "Password123");
        }

        [Fact(Skip = "Data Access test should only be run locally")]
        public void CreateArticle_ShouldWork()
        {
            SQLDapperDataAccessor db = new SQLDapperDataAccessor("Server=.;Database=Blog;Trusted_Connection=True;");
            ArticleModel model = ApiSampleData.GetSampleArticles().First();
            //Assert.Throws<Exception>(() => db.CreateArticle(model)); // <- throws no error because it works
        }

        [Fact(Skip = "Data Access test should only be run locally")]
        public void GetAllArticles_ShouldWork()
        {
            SQLDapperDataAccessor db = new SQLDapperDataAccessor("Server=.;Database=Blog;Trusted_Connection=True;");
            ArticleModel model = ApiSampleData.GetSampleArticles().First();
            List<ArticleModel> models = db.GetAllArticles();
            Assert.NotNull(models);
            Assert.NotNull(models[0].Tags);
            Assert.NotNull(models[0].Comments);
            Assert.NotNull(models[0].ContentText);
        }

        [Fact(Skip = "Data Access test should only be run locally")]
        public void GetCommentById_ShouldWork()
        {
            SQLDapperDataAccessor db = new SQLDapperDataAccessor("Server=.;Database=Blog;Trusted_Connection=True;");
            CommentModel c = db.GetComment(5);
            Assert.NotNull(c);
            Assert.NotNull(c?.Author);
        }

        [Fact]
        public void ArticleModel_dbTagsShouldWork()
        {
            ArticleModel model = new ArticleModel();
            model.Tags = new List<string>
            {
                "ee",
                "00"
            };
            Assert.NotNull(model.Tags);
            string e = model.dbTags;
            Assert.Equal("ee,00", model.dbTags);

            ArticleModel model2 = new ArticleModel { dbTags = "99,east,Lola" };
            List<string> expected = new List<string>
            {
                "99",
                "east",
                "Lola"
            };
            for (int i = 0; i < model2.Tags.Count; i++)
            {
                Assert.Equal(expected[i], model2.Tags[i]);
            }
        }
    }
}
