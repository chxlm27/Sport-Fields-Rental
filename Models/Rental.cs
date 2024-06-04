using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SportFields.Models
{
    public class Rental
    {
        public int Id { get; set; }

        public string TerrainName { get; set; }
        public string UserId { get; set; }

        public int SportFieldId { get; set; }

        public double? PricePerHour { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
//proba masterrr