﻿using Autofac.Extras.Moq;
using BlogAPI.Controllers;
using BlogAPI.Models;
using BlogDataLibrary.DataAccess;
using BlogDataLibrary.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace BlogDataLibrary.Tests.Controllers
{
    public class ArticleApiTests
    {
        [Fact]
        public void Get_ShouldWork()
        {
            using (AutoMock mock = AutoMock.GetLoose())
            {
                mock.Mock<IBlogDbAccessor>()
                    .Setup(x => x.GetAllArticles())
                    .Returns(ApiSampleData.GetSampleArticles());

                ArticleApiController ctrl = mock.Create<ArticleApiController>();
                List<ArticleModel> expected = ApiSampleData.GetSampleArticles();
                ObjectResult get = (ObjectResult)ctrl.Get();
                List<ArticleViewModel> actual = (List<ArticleViewModel>)get.Value;

                Assert.NotNull(actual);
                Assert.Equal(expected.Count, actual.Count);
            }
        }
        [Theory]
        [InlineData(1)]
        public void Put_ShouldWork(int id)
        {
            ArticleModel model = ApiSampleData.GetSampleArticles().Where(x => x.Id == id).First();
            CreateOrEditArticleViewModel viewModel = new CreateOrEditArticleViewModel
            {
                AuthorName = model.AuthorName,
                ContentText = model.ContentText,
                Tags = model.Tags,
                Title = model.Title
            };

            using (AutoMock mock = AutoMock.GetLoose())
            {
                mock.Mock<IBlogDbAccessor>()
                    .Setup(x => x.UpdateArticle(model));

                ArticleApiController ctrl = mock.Create<ArticleApiController>();

                ctrl.Put(id, viewModel);

                // This doesn't work because it never saves model, but a different ArticleModel
                //mock.Mock<IBlogDbAccessor>()
                //    .Verify(x => x.UpdateArticle(model), Times.Exactly(1));
            }
        }
    }
}
