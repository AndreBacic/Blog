using BlogDataLibrary.Models;
using System.Collections.Generic;

namespace BlogAPI.Models
{
    public class CreateOrEditArticleViewModel
    {
        public string Title { get; set; }
        public List<string> Tags { get; set; }
        public string AuthorName { get; set; }
        public string ContentText { get; set; }

        public ArticleModel GetAsDbArticleModel()
        {
            ArticleModel output = new ArticleModel
            {
                AuthorName = this.AuthorName,
                Title = this.Title,
                ContentText = this.ContentText,
                Tags = this.Tags
            };

            return output;
        }
    }
}
