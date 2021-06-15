using System;
using System.Collections.Generic;
using System.Text;

namespace BlogDataLibrary.Models
{
    public class ArticleViewModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime DatePosted { get; set; }
        public DateTime LastEdited { get; set; }
        public List<CommentViewModel> Comments { get; set; }
        public List<string> Tags { get; set; }
        public string AuthorName { get; set; }
        public string Content { get; set; }

        public void SetThisToDbArticleModel(ArticleModel article)
        {
            List<CommentViewModel> commentViews = new List<CommentViewModel>();
            foreach (var c in article.Comments)
            {
                CommentViewModel commentView = new CommentViewModel();
                commentView.SetThisToDbCommentModel(c, this.Id);
                commentViews.Add(commentView);                
            }

            this.Id = article.Id; // TODO: encrypt ViewModel ids before sending them to the front end
            this.AuthorName = article.AuthorName;
            this.Title = article.Title;
            this.Content = article.Content;
            this.DatePosted = article.DatePosted;
            this.LastEdited = article.LastEdited;
            this.Comments = commentViews;
            this.Tags = article.Tags;
        }

        public ArticleModel GetAsDbArticleModel()
        {
            List<CommentModel> comments = new List<CommentModel>();
            foreach (var c in this.Comments)
            {
                CommentModel comment = new CommentModel();
                comment = c.GetAsDbCommentModel();
                comments.Add(comment);
            }

            ArticleModel output = new ArticleModel
            {
                Id = this.Id,
                AuthorName = this.AuthorName,
                Title = this.Title,
                DatePosted = this.DatePosted,
                LastEdited = this.LastEdited,
                Content = this.Content,
                Tags = this.Tags,
                Comments = comments
            };

            return output;
        }
    }
}
