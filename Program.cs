using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using SportFields.Data;
using SportFields.Models;
using System;
using System.IO;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("SportFieldsContextProba"));
});

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Configure role claim type
    options.ClaimsIdentity.RoleClaimType = ClaimsIdentity.DefaultRoleClaimType;
})
.AddEntityFrameworkStores<DataContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"];
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder => builder
            .WithOrigins("http://localhost:44474") // Add the origins (URLs) allowed to access the resource
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

// Ensure the directory exists
var imageDirectoryPath = Path.Combine(app.Environment.ContentRootPath, "ClientApp", "assets", "images", "fields");
if (!Directory.Exists(imageDirectoryPath))
{
    Directory.CreateDirectory(imageDirectoryPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(imageDirectoryPath),
    RequestPath = "/images/fields"
});

app.UseRouting();

// Enable CORS
app.UseCors("AllowSpecificOrigin");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");
app.MapFallbackToFile("index.html");

// Add the following lines to add an admin user during the application startup
using (var scope = app.Services.CreateScope())
{
    var serviceProvider = scope.ServiceProvider;
    var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var logger = serviceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        // Check if the "Admin" role exists, and create it if not
        var adminRoleExists = await roleManager.RoleExistsAsync("Admin");
        if (!adminRoleExists)
        {
            await roleManager.CreateAsync(new IdentityRole("Admin"));
        }

        // Check if the admin user already exists
        var adminUser = await userManager.FindByNameAsync("admin");
        if (adminUser == null)
        {
            // Create admin user
            adminUser = new ApplicationUser
            {
                UserName = "admin",
                Email = "admin@exemplu", // Set the admin's email
                // Set other properties as needed
            };

            var result = await userManager.CreateAsync(adminUser, "ParolaAdmin112!");

            if (result.Succeeded)
            {
                // Assign the "Admin" role to the user
                await userManager.AddToRoleAsync(adminUser, "Admin");
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while creating the admin user and role.");
    }
}

app.Run();
