// ApplicationUser.cs
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;

namespace SportFields.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int Age { get; set; }
        public string Address { get; set; }
        public string PhoneNo { get; set; }

        public ICollection<Rental> Rentals { get; set; } = new List<Rental>();
    }
}
