namespace BlogAPI.Models
{
    public class CreateOrEditCommentViewModel
    {
        public CommentAuthorViewModel Author { get; set; }
        public string ContentText { get; set; }
        /// <summary>
        /// Id of the article this belongs to
        /// </summary>
        public int ArticleId { get; set; }
    }
}
