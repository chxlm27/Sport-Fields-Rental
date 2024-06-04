// DataContext.cs
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SportFields.Models;

namespace SportFields.Data
{
    public class DataContext : IdentityDbContext<ApplicationUser>
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options) { }

        public DbSet<SportField> SportFields { get; set; }
        public DbSet<Rental> Rentals { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Rental>()
                .HasKey(rental => rental.Id);

            modelBuilder.Entity<Rental>()
                .HasOne<ApplicationUser>()
                .WithMany(user => user.Rentals)
                .HasForeignKey(rental => rental.UserId)
                .IsRequired();

        }
    }
}
