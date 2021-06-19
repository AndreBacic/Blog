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
        /// <summary>
        /// Updates all user data BUT the password
        /// </summary>
        /// <param name="user"></param>
        public void UpdateUser(UserModel user);
        /// <summary>
        /// Updates user's password to be newPassword. newPassword is plaintext, and is hashed by this method
        /// </summary>
        /// <param name="user"></param>
        /// <param name="newPassword"></param>
        public void UpdateUserPassword(UserModel user, string newPassword);

        public ArticleModel GetArticle(int id);
        public List<ArticleModel> GetAllArticles();

        /// <summary>
        /// Inserts the article into the database, along with any comments already added to it.
        /// </summary>
        /// <param name="article"></param>
        public void CreateArticle(ArticleModel article);
        public void UpdateArticle(ArticleModel article);
        public void DeleteArticle(ArticleModel article);

        public List<CommentModel> GetAllCommentsInArticle(int articleId);
        public void CreateComment(CommentModel comment, int articleId);
        public void UpdateComment(CommentModel comment);
        public void DeleteComment(int id);
    }
}
