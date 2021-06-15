﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BlogDataLibrary.DataAccess;
using BlogDataLibrary.Models;

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
            foreach (var c in comments)
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
            CommentModel comment = _db.GetComment(id);
            CommentViewModel commentView = new CommentViewModel();
            commentView.SetThisToDbCommentModel(comment);
            return commentView;
        }

        // POST api/<controller>
        [HttpPost]
        public void Post([FromBody]CommentViewModel comment)
        {
            // TODO: Validate user input before saving to the db.
            if (comment.ArticleId > 0)
            {
                _db.CreateComment(comment.GetAsDbCommentModel(), comment.ArticleId);
            }
            else
            {
                // TODO: Figure out how to deal with trying to create a comment marked with an invalid article id.
            }
        }

        // PUT api/<controller>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]CommentViewModel comment)
        {
            // TODO: Validate user input before saving to the db.
            CommentModel dbComment = comment.GetAsDbCommentModel();
            dbComment.Id = id;
            _db.UpdateComment(dbComment);
        }

        // DELETE api/<controller>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            _db.DeleteComment(id);
        }
    }
}
