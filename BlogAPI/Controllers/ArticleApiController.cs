using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BlogDataLibrary.DataAccess;
using BlogDataLibrary.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

            foreach (var a in dbArticles)
            {
                ArticleViewModel articleView = new ArticleViewModel();
                articleView.SetThisToDbArticleModel(a);
                output.Add(articleView);
            }
            return output;
        }

        [Authorize(Policy = "Ensure Commenter Policy")]
        // GET api/<controller>/5
        [HttpGet("{id}")]
        public ArticleViewModel Get(int id)
        {
            ArticleViewModel articleView = new ArticleViewModel();
            articleView.SetThisToDbArticleModel(_db.GetArticle(id));

            return articleView;
        }

        // POST api/<controller>
        [HttpPost]
        public void Post([FromBody]ArticleViewModel article)
        {
            // TODO: Validate user input before saving to the db.
            _db.CreateArticle(article.GetAsDbArticleModel());
        }

        // PUT api/<controller>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]ArticleViewModel article)
        {
            // TODO: Validate user input before saving to the db.
            ArticleModel dbArticle = article.GetAsDbArticleModel();
            dbArticle.Id = id;
            _db.UpdateArticle(dbArticle);
        }

        // DELETE api/<controller>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            var article = _db.GetArticle(id);
            _db.DeleteArticle(article);
        }
    }
}
