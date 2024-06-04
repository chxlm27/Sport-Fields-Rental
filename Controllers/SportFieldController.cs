using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportFields.Data;
using SportFields.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace SportFields.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SportFieldController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IWebHostEnvironment _env;

        public SportFieldController(DataContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<ActionResult<List<SportField>>> Get()
        {
            return Ok(await _context.SportFields.ToListAsync());
        }

        [HttpGet("{identifier}")]
        public async Task<ActionResult<SportField>> GetSportField(string identifier)
        {
            if (int.TryParse(identifier, out int id))
            {
                var sportField = await _context.SportFields
                    .Include(sf => sf.Rentals)
                    .FirstOrDefaultAsync(sf => sf.Id == id);

                if (sportField == null)
                    return BadRequest("Sport Field not found.");

                return Ok(sportField);
            }
            else
            {
                var normalizedSportType = identifier.ToUpper();
                var sportFields = await _context.SportFields
                    .Include(sf => sf.Rentals)
                    .Where(field => field.SportType.ToUpper() == normalizedSportType)
                    .ToListAsync();

                if (sportFields == null || sportFields.Count == 0)
                    return BadRequest("Sport Fields not found for the specified sport type.");

                return Ok(sportFields);
            }
        }

        [HttpPost]
        public async Task<ActionResult<SportField>> AddField([FromForm] SportFieldViewModel model, [FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty.");

            try
            {
                // Generate a unique file name
                var extension = Path.GetExtension(file.FileName);
                var uniqueId = Guid.NewGuid().ToString().Substring(0, 5);
                var fileName = $"{model.TerrainName.ToLower().Replace(" ", "-")}-{uniqueId}{extension}";

                // Ensure the directory exists
                var directoryPath = Path.Combine(_env.ContentRootPath, "ClientApp", "src", "assets", "images", "fields");
                if (!Directory.Exists(directoryPath))
                {
                    Directory.CreateDirectory(directoryPath);
                }

                // Save the file to the 'src/assets/images/fields' directory
                var filePath = Path.Combine(directoryPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Map ViewModel to Entity
                var sportField = new SportField
                {
                    SportType = model.SportType,
                    TerrainName = model.TerrainName,
                    Dimension = model.Dimension,
                    TerrainType = model.TerrainType,
                    Price = model.Price,
                    UrlPath = $"assets/images/fields/{fileName}" // Set the UrlPath here
                };

                _context.SportFields.Add(sportField);
                await _context.SaveChangesAsync();

                return Ok(sportField);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error processing request: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<SportField>> UpdateSportField(int id, [FromForm] SportFieldViewModel request, [FromForm] IFormFile? file)
        {
            var dbField = await _context.SportFields.FindAsync(id);

            if (dbField == null)
                return BadRequest("Sport Field not found.");

            try
            {
                if (file != null && file.Length > 0)
                {
                    // Generate a unique file name
                    var extension = Path.GetExtension(file.FileName);
                    var uniqueId = Guid.NewGuid().ToString().Substring(0, 5);
                    var fileName = $"{request.TerrainName.ToLower().Replace(" ", "-")}-{uniqueId}{extension}";

                    // Ensure the directory exists
                    var directoryPath = Path.Combine(_env.ContentRootPath, "ClientApp", "src", "assets", "images", "fields");
                    if (!Directory.Exists(directoryPath))
                    {
                        Directory.CreateDirectory(directoryPath);
                    }

                    // Save the file to the 'src/assets/images/fields' directory
                    var filePath = Path.Combine(directoryPath, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    dbField.UrlPath = $"assets/images/fields/{fileName}";
                }

                dbField.SportType = request.SportType;
                dbField.TerrainName = request.TerrainName;
                dbField.Dimension = request.Dimension;
                dbField.TerrainType = request.TerrainType;
                dbField.Price = request.Price;

                await _context.SaveChangesAsync();

                return Ok(dbField);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error processing request: {ex.Message}");
            }
        }


        [HttpDelete("{id}")]
        public async Task<ActionResult<SportField>> Delete(int id)
        {
            var dbField = await _context.SportFields.FindAsync(id);
            if (dbField == null)
                return BadRequest("Sport Field not found.");

            var relatedRentals = await _context.Rentals.Where(r => r.SportFieldId == id).ToListAsync();
            _context.Rentals.RemoveRange(relatedRentals);

            _context.SportFields.Remove(dbField);
            await _context.SaveChangesAsync();

            return Ok(dbField);
        }
    }
}
