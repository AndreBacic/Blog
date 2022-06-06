using BlogAPI.Models;
using BlogDataLibrary.DataAccess;
using BlogDataLibrary.Messaging;
using BlogDataLibrary.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace BlogAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentApiController : Controller
    {
        private readonly IBlogDbAccessor _db;
        private readonly IEmailService _emailService;

        public CommentApiController(IBlogDbAccessor db,
                                    IEmailService emailService)
        {
            _db = db;
            _emailService = emailService;
        }
        // GET: api/<controller>
        [HttpGet("{articleId}")]
        public IActionResult Get(int articleId)
        {
            List<CommentModel> comments;
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
        [HttpGet("{articleId}/{id}")] // data is entered like: https://[domain]/api/CommentApi/Get/5/3
        public IActionResult Get(int articleId, int id) // TODO: Refactor url route to not need articleId? There's already a url route with one int...
        {
            try
            {
                // note: id is the id of the comment we're getting
                CommentModel comment = _db.GetComment(id);
                CommentViewModel commentView = new CommentViewModel();
                commentView.SetThisToDbCommentModel(comment, articleId);
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
        public IActionResult Post([FromBody] CreateOrEditCommentViewModel comment)
        {
            // Validate user input before saving to the db.
            ArticleModel article = _db.GetArticle(comment.ArticleId);
            if (IsValidComment(comment) == false || article == null)
            {
                return StatusCode(StatusCodes.Status422UnprocessableEntity);
            }

            CommentModel dbComment = comment.GetAsDbCommentModel();
            dbComment.Author = _db.GetUser(HttpContext.User.Claims
                                            .Where(x => x.Type == ClaimTypes.Email)
                                            .First().Value);
            dbComment.DatePosted = DateTime.UtcNow;
            _db.CreateComment(dbComment, comment.ArticleId);

            List<UserModel> admins = _db.GetAllAdminUsers();
            string body = $@"<div style='text-align:center;font-family:sans-serif;'>
                              <h2>{comment.Author.Name} just commented on 
                               <a href='https://{HttpContext.Request.Host.Value}/article.html?{article.Id}'>
                                {article.Title}</a>
                              </h2>
                             </div>";
            _emailService.SendEmail(admins, new List<UserModel>(), "A blog user just commented", body, false);

            return StatusCode(StatusCodes.Status201Created);
        }

        [Authorize(Policy = ("IsCommenter"))]
        // PUT api/<controller>/5
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody] CreateOrEditCommentViewModel comment)
        {
            // Validate user input before saving to the db.
            if (IsValidComment(comment) == false)
            {
                return StatusCode(StatusCodes.Status422UnprocessableEntity);
            }

            if (IsLoggedInUsersComment(id) == false)
            {
                return StatusCode(StatusCodes.Status401Unauthorized);
            }

            CommentModel dbComment = comment.GetAsDbCommentModel();
            dbComment.Id = id;
            dbComment.LastEdited = DateTime.UtcNow;
            _db.UpdateComment(dbComment);
            return StatusCode(StatusCodes.Status200OK);
        }

        [Authorize(Policy = ("IsCommenter"))]
        // DELETE api/<controller>/5
        [HttpDelete("{articleId}/{id}")] // data is entered like: https://[domain]/api/CommentApi/Delete/5/3
        public IActionResult Delete(int articleId, int id)
        {
            if (IsLoggedInUsersComment(id) || HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.Role).First().Value == UserModel.ADMIN_ROLE)
            {
                _db.DeleteComment(id);
                return StatusCode(StatusCodes.Status200OK);
            }
            return StatusCode(StatusCodes.Status401Unauthorized);
        }

        private bool IsLoggedInUsersComment(int commentId)
        {
            string userEmail = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.Email).First().Value;

            return _db.IsUsersComment(userEmail, commentId);
        }

        private bool IsValidComment(CreateOrEditCommentViewModel comment)
        {
            return !string.IsNullOrWhiteSpace(comment.ContentText) &&
                   comment.ArticleId > 0 &&
                   !(comment.Author is null) &&
                   !string.IsNullOrWhiteSpace(comment.Author.Name);
        }
    }
}
