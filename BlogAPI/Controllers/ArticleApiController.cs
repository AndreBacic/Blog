using BlogAPI.Models;
using BlogDataLibrary.DataAccess;
using BlogDataLibrary.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

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
        public List<ArticleViewModel> Get()
        {
            List<ArticleModel> dbArticles = _db.GetAllArticles();
            List<ArticleViewModel> output = new List<ArticleViewModel>();

            foreach (ArticleModel a in dbArticles)
            {
                ArticleViewModel articleView = new ArticleViewModel();
                articleView.SetThisToDbArticleModel(a);
                output.Add(articleView);
            }
            return output;
        }

        // GET api/<controller>/5
        [HttpGet("{id}")]
        public ArticleViewModel Get(int id)
        {
            ArticleViewModel articleView = new ArticleViewModel();
            articleView.SetThisToDbArticleModel(_db.GetArticle(id));

            return articleView;
        }

        [Authorize(Policy = ("IsAdmin"))]
        // POST api/<controller>
        [HttpPost]
        public void Post([FromBody]ArticleViewModel article)
        {
            // TODO: Validate user input before saving to the db.
            _db.CreateArticle(article.GetAsDbArticleModel());
        }

        [Authorize(Policy = ("IsAdmin"))]
        // PUT api/<controller>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]ArticleViewModel article)
        {
            // TODO: Validate user input before saving to the db.
            ArticleModel dbArticle = article.GetAsDbArticleModel();
            dbArticle.Id = id;
            _db.UpdateArticle(dbArticle);
        }

        [Authorize(Policy = ("IsAdmin"))]
        // DELETE api/<controller>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            ArticleModel article = _db.GetArticle(id);
            _db.DeleteArticle(article);
        }
    }
}
