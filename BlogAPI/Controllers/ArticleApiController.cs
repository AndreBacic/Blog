using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BlogDataLibrary.DataAccess;
using BlogDataLibrary.Models;
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
                List<CommentViewModel> commentViews = new List<CommentViewModel>();
                foreach (var c in a.Comments)
                {
                    UserViewModel author = new UserViewModel
                    {
                        FirstName = c.Author.FirstName,
                        LastName = c.Author.LastName,
                        EmailAddress = c.Author.EmailAddress
                    };
                    CommentViewModel commentView = new CommentViewModel
                    {
                        Author = author,
                        DatePosted = c.DatePosted,
                        LastEdited = c.LastEdited,
                        Content = c.Content
                    };
                }

                ArticleViewModel articleView = new ArticleViewModel
                {
                    AuthorName = a.AuthorName,
                    Title = a.Title,
                    Content = a.Content,
                    DatePosted = a.DatePosted,
                    LastEdited = a.LastEdited,
                    Comments = commentViews,
                    Tags = a.Tags
                };
                output.Add(articleView);
            }
            return output;
        }

        // GET api/<controller>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<controller>
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<controller>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
