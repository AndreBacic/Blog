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
    public class ArticleApiController : Controller
    {
        private readonly IBlogDbAccessor _db;

        public ArticleApiController(IBlogDbAccessor db)
        {
            _db = db;
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
