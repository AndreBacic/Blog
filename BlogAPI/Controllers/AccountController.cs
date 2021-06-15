using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BlogDataLibrary.DataAccess;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace BlogAPI.Controllers
{
    public class AccountController : Controller
    {
        private readonly IBlogDbAccessor _db;

        public AccountController(IBlogDbAccessor db)
        {
            _db = db;
        }
        
        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }
    }
}
