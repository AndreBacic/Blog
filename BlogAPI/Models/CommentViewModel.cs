using System;
using System.Collections.Generic;
using System.Text;

namespace BlogDataLibrary.Models
{
    public class CommentViewModel
    {
        public DateTime DatePosted { get; set; }
        public DateTime LastEdited { get; set; }
        public UserViewModel Author { get; set; }
        public string Content { get; set; }
    }
}
