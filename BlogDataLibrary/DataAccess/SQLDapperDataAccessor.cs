using BlogDataLibrary.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;

namespace BlogDataLibrary.DataAccess
{
    public class SQLDapperDataAccessor : IBlogDbAccessor
    {
        private readonly string _connectionString;

        public SQLDapperDataAccessor(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("SQLBlogDb");
        }
        public void CreateArticle(ArticleModel article)
        {
            throw new NotImplementedException();
        }

        public void CreateComment(CommentModel comment, int articleId)
        {
            throw new NotImplementedException();
        }

        public void CreateUser(UserModel user)
        {
            throw new NotImplementedException();
        }

        public void DeleteArticle(int id)
        {
            throw new NotImplementedException();
        }

        public void DeleteComment(int id)
        {
            throw new NotImplementedException();
        }

        public List<ArticleModel> GetAllArticles()
        {
            throw new NotImplementedException();
        }

        public List<CommentModel> GetAllCommentsInArticle(int articleId)
        {
            throw new NotImplementedException();
        }

        public List<UserModel> GetAllUsers()
        {
            throw new NotImplementedException();
        }

        public ArticleModel GetArticle(int id)
        {
            throw new NotImplementedException();
        }

        public CommentModel GetComment(int id)
        {
            throw new NotImplementedException();
        }

        public UserModel GetUser(int id)
        {
            throw new NotImplementedException();
        }

        public void UpdateArticle(ArticleModel article)
        {
            throw new NotImplementedException();
        }

        public void UpdateComment(CommentModel comment)
        {
            throw new NotImplementedException();
        }

        public void UpdateUser(UserModel user)
        {
            throw new NotImplementedException();
        }
    }
}
