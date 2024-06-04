using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SportFields.Data;
using SportFields.Models;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SportFields.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RentalsController : ControllerBase
    {
        private readonly DataContext _context;

        public RentalsController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Rental>>> GetRentals()
        {
            var rentals = await _context.Rentals.ToListAsync();
            return Ok(rentals);
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Rental>>> GetUserRentals()
        {
            try
            {
                // Get the current user's ID from the claims
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                Console.WriteLine($"User ID from claims: {userId}");

                if (string.IsNullOrEmpty(userId))
                {
                    // Log or return an error response indicating that user ID is missing
                    Console.Error.WriteLine("User ID is missing in claims.");
                    return BadRequest(new { message = "User ID is missing in claims." });
                }

                // Retrieve rentals specific to the logged-in user
                var userRentals = await _context.Rentals
                    .Where(rental => rental.UserId == userId)
                    .ToListAsync();

                // Return the user-specific rentals
                return Ok(userRentals);
            }
            catch (Exception ex)
            {
                // Log the exception or handle it as needed
                Console.Error.WriteLine($"Error retrieving user rentals: {ex}");
                return BadRequest(new { message = "An error occurred while retrieving user rentals.", error = ex.Message });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Rental>> CreateRental(Rental rental)
        {
            try
            {
                // Get the current user's ID from the claims
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                Console.WriteLine($"User ID from claims: {userId}");

                if (string.IsNullOrEmpty(userId))
                {
                    // Log or return an error response indicating that user ID is missing
                    Console.Error.WriteLine("User ID is missing in claims.");
                    return BadRequest(new { message = "User ID is missing in claims." });
                }

                // Log the received rental information
                Console.WriteLine($"Received rental request for user ID: {userId}, SportField ID: {rental.SportFieldId}, Price Per Hour: {rental.PricePerHour}");

                // Set the UserId property of the rental
                rental.UserId = userId;


                // You may want to perform validation or other logic here

                // Add the rental to the context and save changes
                _context.Rentals.Add(rental);
                await _context.SaveChangesAsync();

                // Return the created rental with a 201 Created status
                return CreatedAtAction(nameof(GetRentals), new { id = rental.Id }, rental);
            }
            catch (Exception ex)
            {
                // Log the exception or handle it as needed
                Console.Error.WriteLine($"Error creating rental: {ex}");
                return BadRequest(new { message = "An error occurred while creating the rental.", error = ex.Message });
            }
        }

        [HttpDelete("cancel/{id}")]
        public async Task<ActionResult<List<Rental>>> CancelRental(int id)
        {
            try
            {
                var rental = await _context.Rentals.FindAsync(id);

                if (rental == null)
                {
                    return NotFound($"Rental with ID {id} not found.");
                }

                // Implement your cancellation logic here
                // For example, mark the rental as canceled in the database
                // rental.IsCanceled = true;

                _context.Rentals.Remove(rental);
                await _context.SaveChangesAsync();

                return Ok(await _context.Rentals.ToListAsync());
            }
            catch (Exception ex)
            {
                // Log the exception or handle it appropriately
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpGet("dateFilter")]
        public async Task<ActionResult<IEnumerable<Rental>>> DateFilter(DateTime startDate, DateTime endDate, int fieldId)
        {
            try
            {
                // Retrieve rentals that overlap with the specified date range for the selected field
                var overlappingRentals = await _context.Rentals
                    .Where(rental => rental.SportFieldId == fieldId &&
                                     ((startDate >= rental.StartDate && startDate <= rental.EndDate) ||
                                      (endDate >= rental.StartDate && endDate <= rental.EndDate) ||
                                      (rental.StartDate >= startDate && rental.EndDate <= endDate)))
                    .ToListAsync();

                // Return the overlapping rentals
                return Ok(overlappingRentals);
            }
            catch (Exception ex)
            {
                // Log the exception or handle it as needed
                Console.Error.WriteLine($"Error checking date availability for field {fieldId}: {ex}");
                return BadRequest(new { message = "An error occurred while checking date availability.", error = ex.Message });
            }
        }

        [HttpGet("activeFromDate")]
        public async Task<ActionResult<IEnumerable<Rental>>> GetActiveRentalsFromDate(DateTime startDate)
        {
            return await _context.Rentals
                                 .Where(r => r.EndDate >= startDate || r.StartDate >= DateTime.UtcNow)
                                 .ToListAsync();
        }


        [HttpPost("processPayment")]
        public async Task<ActionResult> ProcessPayment(PaymentDetails paymentDetails)
        {
            try
            {
                // Get the current user's ID from the claims
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                Console.WriteLine($"User ID from claims: {userId}");

                if (string.IsNullOrEmpty(userId))
                {
                    // Log or return an error response indicating that user ID is missing
                    Console.Error.WriteLine("User ID is missing in claims.");
                    return BadRequest(new { message = "User ID is missing in claims." });
                }

                // Log the received payment details
                Console.WriteLine($"Received payment request for user ID: {userId}, Card Number: {paymentDetails.CardNumber}, Expiry Date: {paymentDetails.ExpiryDate}, CVV: {paymentDetails.CVV}");

                // Here you can implement your payment processing logic
                // For now, let's just return a success message
                return Ok(new { message = "Payment processed successfully." });
            }
            catch (Exception ex)
            {
                // Log the exception or handle it as needed
                Console.Error.WriteLine($"Error processing payment: {ex}");
                return StatusCode(500, "Internal server error");
            }
        }


    }
}
