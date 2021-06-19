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
        /// <summary>
        /// Inserts user into the database.
        /// Note: assumes user password is plaintext, and will salt and hash it before inserting.
        /// If password is specified as NOT being plaintext, ensure that it is in the form "iterations.salt.passwordHash"
        /// </summary>
        /// <param name="user"></param>
        public void CreateUser(UserModel user, bool isUserPasswordPlaintext = true);
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
        /// <summary>
        /// Updates the article, but NOT any comments added to it.
        /// </summary>
        /// <param name="article"></param>
        public void UpdateArticle(ArticleModel article);
        public void DeleteArticle(ArticleModel article);

        public List<CommentModel> GetAllCommentsInArticle(int articleId);
        public void CreateComment(CommentModel comment, int articleId);
        public void UpdateComment(CommentModel comment);
        public void DeleteComment(int id);
    }
}
