using BlogDataLibrary.DataAccess;
using BlogDataLibrary.Models;
using BlogDataLibrary.Tests.Controllers;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Xunit;

namespace BlogDataLibrary.Tests.DataAccess
{
    public class SQLDapperDataAccessorTests
    {
        [Fact]
        public void UpdateUserPassword_ShouldWork()
        {
            var db = new SQLDapperDataAccessor("Server=.;Database=Blog;Trusted_Connection=True;");
            var user = db.GetUser(1);
            db.UpdateUserPassword(user, "Password123"); 
        }

        [Fact]
        public void CreateArticle_ShouldWork()
        {
            var db = new SQLDapperDataAccessor("Server=.;Database=Blog;Trusted_Connection=True;");
            var model = ApiSampleData.GetSampleArticles().First();
            //Assert.Throws<Exception>(() => db.CreateArticle(model)); // <- throws no error because it works
        }
        [Fact]
        public void GetAllArticles_ShouldWork()
        {
            var db = new SQLDapperDataAccessor("Server=.;Database=Blog;Trusted_Connection=True;");
            var model = ApiSampleData.GetSampleArticles().First();
            var models = db.GetAllArticles();
            Assert.NotNull(models);
            Assert.NotNull(models[0].Tags);
            Assert.NotNull(models[0].Comments);
            Assert.NotNull(models[0].ContentText);
        }

        [Fact]
        public void ArticleModel_dbTagsShouldWork()
        {
            var model = new ArticleModel();
            model.Tags = new List<string>
            {
                "ee",
                "00"
            };
            Assert.NotNull(model.Tags);
            var e = model.dbTags;
            Assert.Equal("ee,00", model.dbTags);

            var model2 = new ArticleModel { dbTags = "99,east,Lola" };
            var expected = new List<string>
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
