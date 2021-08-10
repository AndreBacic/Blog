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

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BlogAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArticleApiController : Controller
    {
        private readonly IBlogDbAccessor _db;
        private readonly EmailService _emailService;

        public ArticleApiController(IBlogDbAccessor db, 
                                    EmailService emailService)
        {
            _db = db;
            _emailService = emailService;
        }

        // GET: api/<controller>
        [HttpGet]
        public IActionResult Get()
        {
            List<ArticleModel> dbArticles = _db.GetAllArticles();
            List<ArticleViewModel> output = new List<ArticleViewModel>();

            foreach (ArticleModel a in dbArticles)
            {
                ArticleViewModel articleView = new ArticleViewModel();
                articleView.SetThisToDbArticleModel(a);
                output.Add(articleView);
            }
            return StatusCode(StatusCodes.Status200OK, output);
        }

        // GET api/<controller>/5
        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            try
            {
                ArticleViewModel articleView = new ArticleViewModel();
                articleView.SetThisToDbArticleModel(_db.GetArticle(id));

                return StatusCode(StatusCodes.Status200OK, articleView);
            }
            catch (Exception)
            {
                return StatusCode(StatusCodes.Status404NotFound);
            }
        }

        [Authorize(Policy = ("IsAdmin"))]
        // POST api/<controller>
        [HttpPost]
        public IActionResult Post([FromBody]CreateOrEditArticleViewModel article)
        {
            // TODO: Validate user input before saving to the db.
            ArticleModel dbArticle = article.GetAsDbArticleModel();
            dbArticle.DatePosted = DateTime.UtcNow;
            if (string.IsNullOrWhiteSpace(dbArticle.AuthorName))
            {
                dbArticle.AuthorName = HttpContext.User.Claims.Where(x => x.Type == ClaimTypes.Name).First().Value;
            }
            _db.CreateArticle(dbArticle);

            // Notify users of new article
            var users = _db.GetAllUsers().Where(x => x.DoesReceiveNotifications == true).ToList();
            var subject = $"{dbArticle.AuthorName} Just Posted a New Article";

            var articleLink = $"https://{HttpContext.Request.Host.Value}/article.html?{dbArticle.Id}";
            var unsubLink = $"https://{HttpContext.Request.Host.Value}/login.html";
            var body = $@"<div style='text-align:center;font-family:sans-serif;'>
                              <h2>{dbArticle.AuthorName} just wrote</h2>
                              <h1>{dbArticle.Title}</h1>
                              <p style='margin-top:2.5rem;'>To read this new article, click <a href='{articleLink}'>here</a></p>
                              <p style='margin-top:5rem;font-size:0.75rem;'>To unsubscribe, click <a href='{unsubLink}'>here</a></p>
                          </div>";
            _emailService.SendEmail(new List<UserModel>(), users, subject, body, false);

            return StatusCode(StatusCodes.Status201Created);
        }

        [Authorize(Policy = ("IsAdmin"))]
        // PUT api/<controller>/5
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody]CreateOrEditArticleViewModel article)
        {
            // TODO: Validate user input before saving to the db.
            ArticleModel dbArticle = article.GetAsDbArticleModel();
            dbArticle.Id = id;
            dbArticle.LastEdited = DateTime.UtcNow;
            _db.UpdateArticle(dbArticle);
            return StatusCode(StatusCodes.Status200OK);
        }

        [Authorize(Policy = ("IsAdmin"))]
        // DELETE api/<controller>/5
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            ArticleModel article = _db.GetArticle(id);
            _db.DeleteArticle(article);
            return StatusCode(StatusCodes.Status200OK);
        }
    }
}
