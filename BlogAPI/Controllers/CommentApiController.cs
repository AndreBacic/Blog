﻿using BlogAPI.Models;
using BlogDataLibrary.DataAccess;
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

        public CommentApiController(IBlogDbAccessor db)
        {
            _db = db;
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
        public IActionResult Get(int articleId, int id)
        {
            try
            {
                // note: id is the id of the comment we're getting
                CommentModel comment = _db.GetAllCommentsInArticle(articleId)
                                        .Where(c => c.Id == id).First();
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
        public IActionResult Post([FromBody]CreateOrEditCommentViewModel comment)
        {
            // Validate user input before saving to the db.
            if (IsValidComment(comment) == false ||
                _db.GetAllArticles().Any(x => x.Id == comment.ArticleId) == false)
            {
                return StatusCode(StatusCodes.Status422UnprocessableEntity);
            }

            
            CommentModel dbComment = comment.GetAsDbCommentModel();
            dbComment.DatePosted = DateTime.UtcNow;
            _db.CreateComment(dbComment, comment.ArticleId);

            return StatusCode(StatusCodes.Status201Created);            
        }

        [Authorize(Policy = ("IsCommenter"))]
        // PUT api/<controller>/5
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody]CreateOrEditCommentViewModel comment)
        {
            // Validate user input before saving to the db.
            if (IsValidComment(comment) == false)
            {
                return StatusCode(StatusCodes.Status422UnprocessableEntity);
            }

            if (IsLoggedInUsersComment(comment.ArticleId, id) == false)
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

                return string.Equals(oldComment.Author.EmailAddress, userEmail);
            }
            catch (Exception)
            {
                return false;
            }
        }

        private bool IsValidComment(CreateOrEditCommentViewModel comment)
        {
            return !string.IsNullOrWhiteSpace(comment.ContentText) &&
                   comment.ArticleId > 0 &&
                   !(comment.Author is null) &&
                   !string.IsNullOrWhiteSpace(comment.Author.Name) &&
                   !string.IsNullOrWhiteSpace(comment.Author.EmailAddress);
        }
    }
}
