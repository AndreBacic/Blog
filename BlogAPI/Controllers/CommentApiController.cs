using BlogAPI.Models;
using BlogDataLibrary.DataAccess;
using BlogDataLibrary.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

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
        public IActionResult Get(int articleId)
        {
            List<CommentModel> comments = new List<CommentModel>();
            try
            {
                comments = _db.GetAllCommentsInArticle(articleId);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status404NotFound);
            }

            List<CommentViewModel> commentViews = new List<CommentViewModel>();
            foreach (CommentModel c in comments)
            {
                CommentViewModel commentView = new CommentViewModel();
                commentView.SetThisToDbCommentModel(c);
                commentViews.Add(commentView);
            }
            return StatusCode(StatusCodes.Status200OK, commentViews);
        }
        [HttpGet("{articleId}")] // data is entered like: https://[domain]/api/CommentApi/Get/5?id=3
        public IActionResult Get(int articleId, int id)
        {
            try
            {
                // note: id is the id of the comment we're getting
                CommentModel comment = _db.GetAllCommentsInArticle(articleId)
                                        .Where(c => c.Id == id).First();
                CommentViewModel commentView = new CommentViewModel();
                commentView.SetThisToDbCommentModel(comment);
                return StatusCode(StatusCodes.Status200OK, commentView);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status404NotFound);
            }
        }

        [Authorize(Policy = ("IsCommenter"))]
        // POST api/<controller>
        [HttpPost]
        public IActionResult Post([FromBody]CreateOrEditCommentViewModel comment)
        {
            // TODO: Validate user input before saving to the db.
            if (comment.ArticleId > 0 && _db.GetAllArticles().Any(x => x.Id == comment.ArticleId))
            {
                CommentModel dbComment = comment.GetAsDbCommentModel();
                dbComment.DatePosted = DateTime.UtcNow;
                _db.CreateComment(dbComment, comment.ArticleId);

                return StatusCode(StatusCodes.Status201Created);
            }
            else
            {
                // todo: Figure out how to deal with trying to create a comment marked with an invalid article id.
                return StatusCode(StatusCodes.Status400BadRequest);
            }
        }

        [Authorize(Policy = ("IsCommenter"))]
        // PUT api/<controller>/5
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody]CreateOrEditCommentViewModel comment)
        {
            if (IsLoggedInUsersComment(comment.ArticleId, id))
            {
                // todo: Validate user input before saving to the db.
                CommentModel dbComment = comment.GetAsDbCommentModel();
                dbComment.Id = id;
                dbComment.LastEdited = DateTime.UtcNow;
                _db.UpdateComment(dbComment);
                return StatusCode(StatusCodes.Status200OK);
            }
            return StatusCode(StatusCodes.Status401Unauthorized);
        }

        [Authorize(Policy = ("IsCommenter"))]
        // DELETE api/<controller>/5
        [HttpDelete("{articleId}")] // data is entered like: https://[domain]/api/CommentApi/Delete/5?id=3
        public IActionResult Delete(int articleId, int id)
        {
            if (IsLoggedInUsersComment(articleId, id))
            {
                _db.DeleteComment(id);
                return StatusCode(StatusCodes.Status200OK);
            }
            return StatusCode(StatusCodes.Status401Unauthorized);
        }

        private bool IsLoggedInUsersComment(int articleId, int commentId)
        {
            try
            {
                CommentModel oldComment = _db.GetAllCommentsInArticle(articleId)
                                                .Where(x => x.Id == commentId).First();

                // So if there's no error, we check if the old comment was posted by the logged in user.
                string userEmail = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.Email).First().Value;

                return String.Equals(oldComment.Author.EmailAddress, userEmail);
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
