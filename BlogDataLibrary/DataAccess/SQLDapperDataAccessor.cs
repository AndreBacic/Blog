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
            // delete all comments attached to the article
            // delete the article
            throw new NotImplementedException();
        }

        public void DeleteComment(int id)
        {
            throw new NotImplementedException();
        }

        public List<ArticleModel> GetAllArticles()
        {
            // get all articles
            // foreach article, get all comments
            throw new NotImplementedException();
        }

        public List<CommentModel> GetAllCommentsInArticle(int articleId)
        {
            // Get comments by article
            // foreach comment, get author by id
            throw new NotImplementedException();
        }

        public List<UserModel> GetAllUsers()
        {
            throw new NotImplementedException();
        }

        public ArticleModel GetArticle(int id)
        {
            // get article
            // get all of the article's comments
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

        public void UpdateUserPassword(UserModel user, string newPassword)
        {
            throw new NotImplementedException();
        }
    }
}
