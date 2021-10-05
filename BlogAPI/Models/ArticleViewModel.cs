using System;
using System.Collections.Generic;

namespace BlogAPI.Models
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
        public string ContentText { get; set; }
    }
}
