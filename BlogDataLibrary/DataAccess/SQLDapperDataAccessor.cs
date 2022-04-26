using BlogDataLibrary.Models;
using BlogDataLibrary.Security;
using Dapper;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace BlogDataLibrary.DataAccess
{
    public class SQLDapperDataAccessor : IBlogDbAccessor
    {
        private readonly string _connectionString;

        public SQLDapperDataAccessor(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("SQLBlogDb");
        }
        public SQLDapperDataAccessor(string connectionString)
        {
            _connectionString = connectionString;
        }
        public void CreateArticle(ArticleModel article)
        {
            if (article.Title == null ||
                article.DatePosted == null ||
                article.AuthorName == null ||
                article.ContentText == null)
            {
                throw new FormatException("Invalid format for parameter 'article' for method 'CreateArticle': article fields Title, DatePosted, AuthorName, and ContentText cannot be null");
            }
            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@Title", article.Title);
                parameters.Add("@DatePosted", article.DatePosted);
                parameters.Add("@AuthorName", article.AuthorName);
                parameters.Add("@dbTags", article.dbTags);
                parameters.Add("@ContentText", article.ContentText);
                parameters.Add("@id", 0, DbType.Int32, ParameterDirection.Output);

                connection.Execute("dbo.spArticles_Insert", parameters, commandType: CommandType.StoredProcedure);

                article.Id = parameters.Get<int>("@id");
            }

            if (article.Comments != null && article.Comments.Any())
            {
                foreach (CommentModel comment in article.Comments)
                {
                    CreateComment(comment, article.Id);
                }
            }
        }

        public void CreateComment(CommentModel comment, int articleId)
        {
            if (comment.DatePosted == null ||
                comment.ContentText == null ||
                comment.Author == null)
            {
                throw new FormatException("Invalid format for parameter 'comment' for method 'CreateComment': comment fields DatePosted, Author, and ContentText cannot be null");
            }

            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@ArticleId", articleId);
                parameters.Add("@DatePosted", comment.DatePosted);
                parameters.Add("@ContentText", comment.ContentText);
                parameters.Add("@AuthorId", comment.Author.Id);
                parameters.Add("@id", 0, DbType.Int32, ParameterDirection.Output);

                connection.Execute("dbo.spComments_Insert", parameters, commandType: CommandType.StoredProcedure);

                comment.Id = parameters.Get<int>("@id");
            }
        }

        public void CreateRefreshToken(RefreshTokenModel token)
        {
            if (String.IsNullOrWhiteSpace(token.Token) ||
                token.Created == null ||
                String.IsNullOrWhiteSpace(token.CreatedByIp) ||
                token.Expires == null ||
                token.OwnerId == 0)
            {
                throw new FormatException("Invalid format for parameter 'token' for method 'CreateRefreshToken': no token fields except token.Id may be null or whitespace");
            }

            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@Token", token.Token);
                parameters.Add("@Created", token.Created);
                parameters.Add("@CreatedByIp", token.CreatedByIp);
                parameters.Add("@Expires", token.Expires);
                parameters.Add("@OwnerId", token.OwnerId);
                parameters.Add("@id", 0, DbType.Int32, ParameterDirection.Output);

                connection.Execute("dbo.spRefreshTokens_Insert", parameters, commandType: CommandType.StoredProcedure);

                token.Id = parameters.Get<int>("@id");
            }
        }

        public void CreateUser(UserModel user, bool isUserPasswordPlaintext)
        {
            if (user.FirstName == null ||
                user.LastName == null ||
                user.EmailAddress == null ||
                user.Role == null ||
                user.PasswordHash == null)
            {
                throw new FormatException("Invalid format for parameter 'user' for method 'CreateUser': no user fields except user.Id may be null");
            }

            string dbPasswordHash = user.PasswordHash;
            if (isUserPasswordPlaintext)
            {
                dbPasswordHash = HashAndSalter.HashAndSalt(user.PasswordHash).ToDbString();
            }

            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@FirstName", user.FirstName);
                parameters.Add("@LastName", user.LastName);
                parameters.Add("@EmailAddress", user.EmailAddress);
                parameters.Add("@Role", user.Role);

                parameters.Add("@PasswordHash", dbPasswordHash);

                parameters.Add("@DoesReceiveNotifications", user.DoesReceiveNotifications);
                parameters.Add("@id", 0, DbType.Int32, ParameterDirection.Output);

                connection.Execute("dbo.spUsers_Insert", parameters, commandType: CommandType.StoredProcedure);

                user.Id = parameters.Get<int>("@id");
            }
        }

        public void DeleteArticle(ArticleModel article)
        {
            // HACK: Change spArticles_Delete to delete all comments and db links to the article
            // delete all comments attached to the article
            foreach (CommentModel comment in article.Comments)
            {
                DeleteComment(comment.Id);
            }

            // delete the article
            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@id", article.Id);

                connection.Execute("dbo.spArticles_Delete", parameters, commandType: CommandType.StoredProcedure);
            }
        }

        public void DeleteComment(int id)
        {
            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@id", id);

                connection.Execute("dbo.spComments_Delete", parameters, commandType: CommandType.StoredProcedure);
            }
        }

        public void DeleteRefreshToken(int id)
        {
            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@id", id);

                connection.Execute("dbo.spRefreshTokens_Delete", parameters, commandType: CommandType.StoredProcedure);
            }
        }

        public void DeleteUser(int id)
        {
            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@id", id);

                connection.Execute("dbo.spUsers_Delete", parameters, commandType: CommandType.StoredProcedure);
            }
        }

        public List<ArticleModel> GetAllArticles()
        {
            List<ArticleModel> output = new List<ArticleModel>();

            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                output = connection.Query<ArticleModel>("dbo.spArticles_GetAll", commandType: CommandType.StoredProcedure)
                                    .ToList();
            }

            foreach (ArticleModel article in output)
            {
                article.Comments = GetAllCommentsInArticle(article.Id);
            }

            return output;
        }

        public List<CommentModel> GetAllCommentsInArticle(int articleId)
        {
            List<CommentModel> output = new List<CommentModel>();

            // Get comments by article
            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@ArticleId", articleId);

                output = connection.Query<CommentModel>("dbo.spComments_GetByArticle", parameters, commandType: CommandType.StoredProcedure)
                                    .ToList();
            }

            // HACK: Refactor spComments_GetByArticle to return author intead forcing an n+1 query
            foreach (CommentModel comment in output)
            {
                comment.Author = GetUser(comment.AuthorId);
            }

            return output;
        }

        public List<RefreshTokenModel> GetAllRefreshTokens()
        {
            List<RefreshTokenModel> output = new List<RefreshTokenModel>();

            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                output = connection.Query<RefreshTokenModel>("dbo.spRefreshTokens_GetAll", commandType: CommandType.StoredProcedure)
                                    .ToList();
            }
            return output;
        }

        public List<UserModel> GetAllUsers()
        {
            List<UserModel> output = new List<UserModel>();

            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                output = connection.Query<UserModel>("dbo.spUsers_GetAll", commandType: CommandType.StoredProcedure)
                                    .ToList();
            }
            return output;
        }

        public ArticleModel GetArticle(int id)
        {
            ArticleModel output = new ArticleModel();

            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@id", id);

                output = connection.Query<ArticleModel>("dbo.spArticles_GetById", parameters, commandType: CommandType.StoredProcedure)
                                    .First();
            }

            output.Comments = GetAllCommentsInArticle(output.Id);

            return output;
        }

        public List<RefreshTokenModel> GetRefreshTokensByUserId(int userId)
        {
            List<RefreshTokenModel> output = new List<RefreshTokenModel>();

            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@OwnerId", userId);

                output = connection.Query<RefreshTokenModel>("dbo.spRefreshTokens_GetByUser", parameters, commandType: CommandType.StoredProcedure).ToList();
            }
            return output;
        }

        public UserModel GetUser(int id)
        {
            UserModel output = new UserModel();

            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@UserId", id);

                output = connection.Query<UserModel>("dbo.spUsers_GetById", parameters, commandType: CommandType.StoredProcedure)
                                    .First();
            }
            return output;
        }

        public UserModel GetUser(string email)
        {
            UserModel output = new UserModel();

            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@email", email);

                output = connection.Query<UserModel>("dbo.spUsers_GetByEmail", parameters, commandType: CommandType.StoredProcedure)
                                    .FirstOrDefault(); // may return null
            }
            return output;
        }

        public void UpdateArticle(ArticleModel article)
        {
            if (article.Title == null ||
                article.LastEdited == null ||
                article.AuthorName == null ||
                article.ContentText == null)
            {
                throw new FormatException("Invalid format for parameter 'article' for method 'UpdateArticle': article fields Title, LastEdited, AuthorName, and ContentText cannot be null");
            }
            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@id", article.Id, DbType.Int32);
                parameters.Add("@Title", article.Title);
                parameters.Add("@LastEdited", article.LastEdited);
                parameters.Add("@AuthorName", article.AuthorName);
                parameters.Add("@dbTags", article.dbTags);
                parameters.Add("@ContentText", article.ContentText);

                connection.Execute("dbo.spArticles_Update", parameters, commandType: CommandType.StoredProcedure);
            }
        }

        public void UpdateComment(CommentModel comment)
        {
            if (comment.LastEdited == null ||
                comment.ContentText == null)
            {
                throw new FormatException("Invalid format for parameter 'comment' for method 'UpdateComment': comment fields LastEdited and ContentText cannot be null");
            }

            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@id", comment.Id, DbType.Int32);
                parameters.Add("@LastEdited", comment.LastEdited);
                parameters.Add("@ContentText", comment.ContentText);

                connection.Execute("dbo.spComments_Update", parameters, commandType: CommandType.StoredProcedure);
            }
        }

        public void UpdateUser(UserModel user)
        {
            if (user.FirstName == null ||
                user.LastName == null ||
                user.EmailAddress == null ||
                user.Role == null)
            {
                throw new FormatException("Invalid format for parameter 'user' for method 'UpdateUser': no user fields may be null");
            }

            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@id", user.Id, DbType.Int32);
                parameters.Add("@FirstName", user.FirstName);
                parameters.Add("@LastName", user.LastName);
                parameters.Add("@EmailAddress", user.EmailAddress);
                parameters.Add("@Role", user.Role);
                parameters.Add("@DoesReceiveNotifications", user.DoesReceiveNotifications);

                connection.Execute("dbo.spUsers_Update", parameters, commandType: CommandType.StoredProcedure);
            }
        }

        public void UpdateUserPassword(UserModel user, string newPassword)
        {
            // hash the password
            PasswordHashModel passwordHashModel = HashAndSalter.HashAndSalt(newPassword);

            // store hashed password in database
            using (IDbConnection connection = new System.Data.SqlClient.SqlConnection(_connectionString))
            {
                DynamicParameters parameters = new DynamicParameters();
                parameters.Add("@id", user.Id, DbType.Int32);
                parameters.Add("@PasswordHash", passwordHashModel.ToDbString());

                connection.Execute("dbo.spUsers_UpdatePassword", parameters, commandType: CommandType.StoredProcedure);
            }
        }
    }
}
