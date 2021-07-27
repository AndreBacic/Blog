using BlogAPI.Models;
using BlogDataLibrary.DataAccess;
using BlogDataLibrary.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BlogAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentApiController : Controller
    {
        private readonly IBlogDbAccessor _db;

        public CommentApiController(IBlogDbAccessor db)
        {
            _db = db;
        }
        // GET: api/<controller>
        [HttpGet("{articleId}")]
        public List<CommentViewModel> Get(int articleId)
        {
            List<CommentModel> comments = _db.GetAllCommentsInArticle(articleId);

            List<CommentViewModel> commentViews = new List<CommentViewModel>();
            foreach (CommentModel c in comments)
            {
                CommentViewModel commentView = new CommentViewModel();
                commentView.SetThisToDbCommentModel(c);
                commentViews.Add(commentView);
            }
            return commentViews;
        }
        [HttpGet("articleId")] // data is entered like: https://[domain]/api/CommentApiController/Get/5?id=3
        public CommentViewModel Get(int articleId, int id)
        {
            // note: id is the id of the comment we're getting
            CommentModel comment = _db.GetAllCommentsInArticle(articleId)
                                    .Where(c => c.Id == id).First();
            CommentViewModel commentView = new CommentViewModel();
            commentView.SetThisToDbCommentModel(comment);
            return commentView;
        }

        [Authorize(Policy = ("IsCommenter"))]
        // POST api/<controller>
        [HttpPost]
        public void Post([FromBody]CreateOrEditCommentViewModel comment)
        {
            // TODO: Validate user input before saving to the db.
            if (comment.ArticleId > 0)
            {
                CommentModel dbComment = comment.GetAsDbCommentModel();
                dbComment.DatePosted = DateTime.UtcNow;
                _db.CreateComment(dbComment, comment.ArticleId);
            }
            else
            {
                // TODO: Figure out how to deal with trying to create a comment marked with an invalid article id.
            }
        }

        [Authorize(Policy = ("IsCommenter"))]
        // PUT api/<controller>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]CreateOrEditCommentViewModel comment)
        {
            // TODO: Validate user input before saving to the db.
            CommentModel dbComment = comment.GetAsDbCommentModel();
            dbComment.Id = id;
            dbComment.LastEdited = DateTime.UtcNow;
            _db.UpdateComment(dbComment);
        }

        [Authorize(Policy = ("IsCommenter"))]
        // DELETE api/<controller>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            // TODO: Validate that the comment id is for the logged in user's comment and not just a random comment.
            _db.DeleteComment(id);
        }
    }
}
