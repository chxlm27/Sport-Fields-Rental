using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SportFields.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SportFields.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RolesController : ControllerBase
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager; // Assuming ApplicationUser is your user class

        public RolesController(RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
        }

        [HttpGet("admin-role-id")]
        public async Task<IActionResult> GetAdminRoleId()
        {
            var role = await _roleManager.FindByNameAsync("Admin");
            if (role != null)
            {
                return Ok(role.Id);
            }
            else
            {
                return NotFound("Admin role not found");
            }
        }

        [HttpGet("admin-users")]
        public async Task<IActionResult> GetAdminUsers()
        {
            var usersInAdminRole = new List<ApplicationUser>();
            var users = _userManager.Users.ToList();

            foreach (var user in users)
            {
                if (await _userManager.IsInRoleAsync(user, "Admin"))
                {
                    usersInAdminRole.Add(user);
                }
            }

            // Depending on your privacy policy, you might want to limit the user information exposed
            var adminUsernames = usersInAdminRole.Select(u => u.Id); // or Email, Id, etc.

            return Ok(adminUsernames);
        }

        [HttpGet("salut")]
        public IActionResult Salut()
        {
            return Ok(); // Returns an empty 200 OK response
        }
    }
}