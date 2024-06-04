using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportFields.Data;
using SportFields.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SportFields.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly DataContext _context;

        public UsersController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApplicationUser>>> GetUsers()
        {
            var users = await _context.Users.ToListAsync(); //Users
            return Ok(users);
        }
    }
}
