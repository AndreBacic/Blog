using System;

namespace BlogAPI.Models
{
    public class CommentViewModel
    {
        public int Id { get; set; }
        public DateTime DatePosted { get; set; }
        public DateTime LastEdited { get; set; }
        public CommentAuthorViewModel Author { get; set; } = new CommentAuthorViewModel();
        public string ContentText { get; set; }
        /// <summary>
        /// Id of the article this belongs to
        /// </summary>
        public int ArticleId { get; set; }
    }
}
