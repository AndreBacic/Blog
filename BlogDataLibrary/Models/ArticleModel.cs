using System;
using System.Collections.Generic;
using System.Linq;

namespace BlogDataLibrary.Models
{
    public class ArticleModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime DatePosted { get; set; }
        public DateTime LastEdited { get; set; }
        public List<CommentModel> Comments { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
        public string AuthorName { get; set; }
        public string ContentText { get; set; }

        public string dbTags
        {
            get
            {
                string output = null;
                if (Tags != null)
                {
                    output = "";
                    foreach (string tag in Tags)
                    {
                        output += tag + ",";
                    }
                    if (output.Length > 0)
                    {
                        output = output.Remove(output.Length - 1);
                    }
                }
                return output;
            }
            set => Tags = value.Split(',').ToList();
        }
    }
}
