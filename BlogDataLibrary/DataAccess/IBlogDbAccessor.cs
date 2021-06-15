using BlogDataLibrary.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace BlogDataLibrary.DataAccess
{
    public interface IBlogDbAccessor
    {
        public UserModel GetUser(int id);
        public List<UserModel> GetAllUsers();
        public void CreateUser(UserModel user);
        public void UpdateUser(UserModel user);

        public ArticleModel GetArticle(int id);
        public List<ArticleModel> GetAllArticles();
        public void CreateArticle(ArticleModel article);
        public void UpdateArticle(ArticleModel article);
        public void DeleteArticle(int id);

        public CommentModel GetComment(int id);
        public List<CommentModel> GetAllComments();
        public void CreateComment(CommentModel comment);
        public void UpdateComment(CommentModel comment);
        public void DeleteComment(int id);
    }
}
