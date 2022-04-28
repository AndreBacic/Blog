using BlogDataLibrary.Models;
using System.Collections.Generic;

namespace BlogDataLibrary.DataAccess
{
    public interface IBlogDbAccessor
    {
        public UserModel GetUser(int id);
        public UserModel GetUser(string email);
        public List<UserModel> GetAllUsers();
        public List<UserModel> GetAllUsersWhoReceiveNotifications();
        /// <summary>
        /// Inserts user into the database.
        /// Note: assumes user password is plaintext, and will salt and hash it before inserting.
        /// If password is specified as NOT being plaintext, ensure that it is in the form "iterations.salt.passwordHash"
        /// </summary>
        /// <param name="user"></param>
        public void CreateUser(UserModel user, bool isUserPasswordPlaintext);
        /// <summary>
        /// Updates all user data BUT the password
        /// </summary>
        /// <param name="user"></param>
        public void UpdateUser(UserModel user);
        public bool IsUsersComment(string email, int commentId);
        /// <summary>
        /// Updates user's password to be newPassword. newPassword is plaintext, and is hashed by this method
        /// </summary>
        /// <param name="user"></param>
        /// <param name="newPassword"></param>
        public void UpdateUserPassword(UserModel user, string newPassword);
        public void DeleteUser(int id);

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
        /// <summary>
        /// Deletes the article and all comments associated with it.
        /// </summary>
        /// <param name="articleId"></param>
        public void DeleteArticle(int articleId);

        public List<CommentModel> GetAllCommentsInArticle(int articleId);
        public CommentModel GetComment(int id);
        public void CreateComment(CommentModel comment, int articleId);
        public void UpdateComment(CommentModel comment);
        public void DeleteComment(int id);

        public List<RefreshTokenModel> GetAllRefreshTokens();
        public List<RefreshTokenModel> GetRefreshTokensByUserId(int userId);
        public RefreshTokenModel GetRefreshToken(string token);
        public void CreateRefreshToken(RefreshTokenModel token);
        public void DeleteRefreshToken(int id);
        /// <summary>
        /// Revokes all refresh tokens for the specified user.
        /// </summary>
        /// <param name="userId"></param>
        public void DeleteRefreshTokensByUserId(int userId);
    }
}
