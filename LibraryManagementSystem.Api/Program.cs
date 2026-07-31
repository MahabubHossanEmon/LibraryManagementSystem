using LibraryManagementSystem.Domain.Interfaces;
using LibraryManagementSystem.Infrastructure.Data;
using LibraryManagementSystem.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Application Layer Registrations
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(LibraryManagementSystem.Application.Mappings.MappingProfile).Assembly);
    cfg.AddOpenBehavior(typeof(LibraryManagementSystem.Application.Behaviors.ValidationBehavior<,>));
});
builder.Services.AddAutoMapper(config => { config.AddProfile<LibraryManagementSystem.Application.Mappings.MappingProfile>(); });
builder.Services.AddValidatorsFromAssembly(typeof(LibraryManagementSystem.Application.Mappings.MappingProfile).Assembly);

// Authentication & JWT setup
builder.Services.Configure<LibraryManagementSystem.Infrastructure.Services.JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.AddScoped<LibraryManagementSystem.Application.Interfaces.IJwtProvider, LibraryManagementSystem.Infrastructure.Services.JwtProvider>();

builder.Services.AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<LibraryManagementSystem.Infrastructure.Services.JwtSettings>();
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings?.Issuer,
            ValidAudience = jwtSettings?.Audience,
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSettings?.SecretKey ?? ""))
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// Auto-migrate and seed initial data
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.Migrate();

        if (!db.Branches.Any())
        {
            var branch = new LibraryManagementSystem.Domain.Entities.Branch
            {
                Id = Guid.NewGuid(),
                Name = "Central Library",
                Address = "100 Main Street, Cityville",
                ContactNumber = "+1 (555) 019-2834"
            };
            db.Branches.Add(branch);

            var adminUser = new LibraryManagementSystem.Domain.Entities.User
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Email = "admin@lms.com",
                PasswordHash = "admin123",
                FirstName = "Admin",
                LastName = "User",
                Role = LibraryManagementSystem.Domain.Enums.Role.Admin
            };
            db.Users.Add(adminUser);

            var book1 = new LibraryManagementSystem.Domain.Entities.Book
            {
                Id = Guid.NewGuid(),
                Title = "Clean Architecture",
                Author = "Robert C. Martin",
                ISBN = "978-0134494166",
                Publisher = "Prentice Hall",
                YearPublished = 2017,
                TotalCopies = 5,
                AvailableCopies = 5,
                BranchId = branch.Id
            };
            var book2 = new LibraryManagementSystem.Domain.Entities.Book
            {
                Id = Guid.NewGuid(),
                Title = "Design Patterns",
                Author = "Erich Gamma et al.",
                ISBN = "978-0201633610",
                Publisher = "Addison-Wesley",
                YearPublished = 1994,
                TotalCopies = 3,
                AvailableCopies = 3,
                BranchId = branch.Id
            };
            db.Books.AddRange(book1, book2);

            db.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database Migration / Seed Error: {ex.Message}");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/openapi/v1.json", "LibraryManagementSystem API v1"));
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();
app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();
