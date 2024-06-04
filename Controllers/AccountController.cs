using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using SportFields.DTOs;
using SportFields.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("[controller]")]
public class AccountController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AccountController> _logger;

    public AccountController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration,
        ILogger<AccountController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        try
        {
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                Age = model.Age,
                Address = model.Address,
                PhoneNo = model.PhoneNo
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                _logger.LogInformation("User created successfully.");
                return Ok(); // Or return appropriate DTO/response
            }

            foreach (var error in result.Errors)
            {
                _logger.LogError($"Error: {error.Description}");
            }

            return BadRequest(result.Errors);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Exception during user registration: {ex}");
            throw; // Rethrow the exception for visibility
        }
    }


    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
        {
            // Generate token
            var token = GenerateJwtToken(user);

            // Return the token and user information
            return Ok(new { token, user = new { email = user.Email } });
        }

        return Unauthorized();
    }

    [HttpPost("logout")]
    [HttpGet("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok();
    }

    private string GenerateJwtToken(ApplicationUser user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Secret"]);

        var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(ClaimTypes.Email, user.Email),
    };

        // Retrieve the roles for the user using UserManager
        var userRoles = _userManager.GetRolesAsync(user).Result; // Blocking call

        // Check if the user has the Admin role and add the appropriate role claim
        if (userRoles.Contains("Admin"))
        {
            claims.Add(new Claim(ClaimTypes.Role, "Admin"));
        }
        else
        {
            claims.Add(new Claim(ClaimTypes.Role, "User"));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:ExpiresInMinutes"])),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }


    [HttpGet("is-admin/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> IsAdmin(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(roles.Contains("Admin"));
    }

    [HttpGet("is-admin-by-id/{userId}")]
    [Authorize(Roles = "Admin")]  // Only allow access to admins
    public async Task<IActionResult> IsAdminById(string userId)
    {
        if (!Guid.TryParse(userId, out var guid))
        {
            return BadRequest("Invalid user ID format");
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound("User not found");
        }

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(roles.Contains("Admin"));
    }
    [HttpGet("is-regular-user/{userId}")]
    [Authorize] // Ensure only authenticated users can access this method
    public async Task<IActionResult> IsRegularUser(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        var roles = await _userManager.GetRolesAsync(user);
        bool isRegularUser = !roles.Contains("Admin"); // A regular user if not an admin

        return Ok(isRegularUser);
    }
}
