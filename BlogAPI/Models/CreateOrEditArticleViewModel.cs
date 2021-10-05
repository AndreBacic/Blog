using System.Collections.Generic;

namespace BlogAPI.Models
{
    public class CreateOrEditArticleViewModel
    {
        public string Title { get; set; }
        public List<string> Tags { get; set; }
        public string AuthorName { get; set; }
        public string ContentText { get; set; }
    }
}
