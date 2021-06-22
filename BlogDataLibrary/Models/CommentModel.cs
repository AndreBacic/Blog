using System;
using System.Collections.Generic;
using System.Text;

namespace BlogDataLibrary.Models
{
    public class CommentModel
    {
        public int Id { get; set; }
        public DateTime DatePosted { get; set; }
        public DateTime LastEdited { get; set; }
        public int AuthorId { get; set; }
        public UserModel Author { get; set; }
        public string ContentText { get; set; }
    }
}
