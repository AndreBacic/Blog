using System;
using System.Collections.Generic;
using System.Text;
using BlogDataLibrary.Models;

namespace BlogAPI.Models
{
    public class CommentViewModel
    {
        public int Id { get; set; }
        public DateTime DatePosted { get; set; }
        public DateTime LastEdited { get; set; }
        public UserViewModel Author { get; set; } = new UserViewModel();
        public string ContentText { get; set; }
        /// <summary>
        /// Id of the article this belongs to
        /// </summary>
        public int ArticleId { get; set; }
        public void SetThisToDbCommentModel(CommentModel comment, int articleId = -1)
        {
            this.Id = comment.Id;
            this.Author.SetThisToDbUserModel(comment.Author);
            this.DatePosted = comment.DatePosted;
            this.LastEdited = comment.LastEdited;
            this.ContentText = comment.ContentText;
            this.ArticleId = articleId;
        }
        public CommentModel GetAsDbCommentModel()
        {
            CommentModel output = new CommentModel
            {
                Id = this.Id,
                Author = this.Author.GetAsDbUserModel(),
                DatePosted = this.DatePosted,
                LastEdited = this.LastEdited,
                ContentText = this.ContentText
            };
            return output;
        }
    }
}
