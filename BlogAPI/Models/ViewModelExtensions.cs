using BlogDataLibrary.Models;
using BlogDataLibrary.Security;
using System.Collections.Generic;

namespace BlogAPI.Models
{
    public static class ViewModelExtensions
    {
        public static void SetThisToDbArticleModel(this ArticleViewModel @this, ArticleModel article)
        {
            List<CommentViewModel> commentViews = new List<CommentViewModel>();
            foreach (CommentModel c in article.Comments)
            {
                CommentViewModel commentView = new CommentViewModel();
                commentView.SetThisToDbCommentModel(c, @this.Id);
                commentViews.Add(commentView);
            }

            @this.Id = article.Id; // todo: encrypt ViewModel ids before sending them to the front end? That might not make a difference...
            @this.AuthorName = article.AuthorName;
            @this.Title = article.Title;
            @this.ContentText = article.ContentText;
            @this.DatePosted = article.DatePosted;
            @this.LastEdited = article.LastEdited;
            @this.Comments = commentViews;
            @this.Tags = article.Tags;
        }

        public static ArticleModel GetAsDbArticleModel(this ArticleViewModel @this)
        {
            List<CommentModel> comments = new List<CommentModel>();
            foreach (CommentViewModel c in @this.Comments)
            {
                comments.Add(c.GetAsDbCommentModel());
            }

            ArticleModel output = new ArticleModel
            {
                Id = @this.Id,
                AuthorName = @this.AuthorName,
                Title = @this.Title,
                DatePosted = @this.DatePosted,
                LastEdited = @this.LastEdited,
                ContentText = @this.ContentText,
                Tags = @this.Tags,
                Comments = comments
            };

            return output;
        }

        public static void SetThisToDbCommentModel(this CommentViewModel @this, CommentModel comment, int articleId = -1)
        {
            @this.Id = comment.Id;
            @this.Author.SetThisToDbUserModel(comment.Author);
            @this.DatePosted = comment.DatePosted;
            @this.LastEdited = comment.LastEdited;
            @this.ContentText = comment.ContentText;
            @this.ArticleId = articleId;
        }
        public static CommentModel GetAsDbCommentModel(this CommentViewModel @this)
        {
            CommentModel output = new CommentModel
            {
                Id = @this.Id,
                Author = @this.Author.GetAsDbUserModel(),
                DatePosted = @this.DatePosted,
                LastEdited = @this.LastEdited,
                ContentText = @this.ContentText
            };
            return output;
        }

        /// <summary>
        /// Hashes this's plaintext password and returns a UserModel with most fields filled out.
        /// Assumes the new account is for a commenter.
        /// </summary>
        /// <returns></returns>
        public static UserModel GetAsDbUserModel(this CreateAccountViewModel @this)
        {
            string dbPasswordHash = HashAndSalter.HashAndSalt(@this.Password).ToDbString();
            UserModel output = new UserModel
            {
                FirstName = @this.FirstName,
                LastName = @this.LastName,
                EmailAddress = @this.EmailAddress,
                PasswordHash = dbPasswordHash,
                Role = UserModel.COMMENTER_ROLE,
                DoesReceiveNotifications = @this.DoesReceiveNotifications
            };
            return output;
        }

        public static ArticleModel GetAsDbArticleModel(this CreateOrEditArticleViewModel @this)
        {
            ArticleModel output = new ArticleModel
            {
                AuthorName = @this.AuthorName,
                Title = @this.Title,
                ContentText = @this.ContentText,
                Tags = @this.Tags
            };

            return output;
        }

        public static CommentModel GetAsDbCommentModel(this CreateOrEditCommentViewModel @this)
        {
            CommentModel output = new CommentModel
            {
                Author = @this.Author.GetAsDbUserModel(),
                ContentText = @this.ContentText
            };
            return output;
        }

        public static void SetThisToDbUserModel(this UserViewModel @this, UserModel user)
        {
            @this.Id = user.Id;
            @this.FirstName = user.FirstName;
            @this.LastName = user.LastName;
            @this.EmailAddress = user.EmailAddress;
            @this.DoesReceiveNotifications = user.DoesReceiveNotifications;
        }
        public static UserModel GetAsDbUserModel(this UserViewModel @this)
        {
            UserModel output = new UserModel
            {
                Id = @this.Id,
                FirstName = @this.FirstName,
                LastName = @this.LastName,
                EmailAddress = @this.EmailAddress,
                DoesReceiveNotifications = @this.DoesReceiveNotifications
            };
            return output;
        }
    }
}
