using System.Text.Json.Serialization;

namespace SportFields.Models
{
    public class SportField
    {
        public int Id { get; set; }
        public string? SportType { get; set; }
        public string TerrainName { get; set; }
        public string? Dimension { get; set; }
        public string? TerrainType { get; set; }
        public int Price { get; set; }
        //public byte[]? ImageData { get; set; } 
        public string UrlPath { get; set; }
        [JsonIgnore] 
        public ICollection<Rental>? Rentals { get; set; }
    }
}
