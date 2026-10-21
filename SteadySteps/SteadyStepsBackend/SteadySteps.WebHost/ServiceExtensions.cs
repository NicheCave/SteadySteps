using System.Text.Json.Serialization;
using SteadySteps.BLL;
using SteadySteps.DAL.Data;
using SteadySteps.DAL.Models;
using SteadySteps.WebHost.Seeding;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;
using Microsoft.EntityFrameworkCore;

namespace SteadySteps.WebHost;

public static class ServiceExtensions
{
    public static void AddServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddServices();
        builder.Services
            .AddControllers(opt => opt.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider()))
            .AddJsonOptions(opt => { opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()); });
    }

    public static void AddDbContext(this WebApplicationBuilder builder)
    {
        builder.Services.AddDbContext<SteadyStepsDbContext>(opt =>
        {
            opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
        });
    }

    public static void AddSwagger(this WebApplicationBuilder builder)
    {
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
    }

    public static void AddIdentity(this WebApplicationBuilder builder)
    {
        builder.Services
            .AddIdentity<User, IdentityRole<Guid>>(opt =>
            {
                opt.User.RequireUniqueEmail = true;
                opt.Password.RequiredLength = 8;
                opt.SignIn.RequireConfirmedAccount = false;
                opt.SignIn.RequireConfirmedEmail = false;
                opt.SignIn.RequireConfirmedPhoneNumber = false;
            })
            .AddEntityFrameworkStores<SteadyStepsDbContext>()
            .AddDefaultTokenProviders();

        // The frontend (http://localhost:5173) and this API (https://localhost:7271) differ
        // in scheme, so browsers treat them as cross-site under "schemeful same-site" rules.
        // The default SameSite=Lax cookie gets silently dropped on cross-site XHR requests —
        // SameSite=None (with Secure, which None requires) is needed for the cookie to be sent.
        builder.Services.ConfigureApplicationCookie(opt =>
        {
            opt.Cookie.SameSite = SameSiteMode.None;
            opt.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        });
    }

    public static void AddLogging(this WebApplicationBuilder builder)
    {
        builder.Services.AddLogging(config => config.AddConsole());
    }

    public static void AddCors(this WebApplicationBuilder builder)
    {
        if (builder.Environment.IsDevelopment())
        {
            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy => policy
                    .WithOrigins("http://localhost:5173")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials());
            });
        }
    }

    public static void AddAutoMapper(this WebApplicationBuilder builder)
    {
        builder.Services.AddAutoMapper();
    }

    public static void AddDemoData(this WebApplicationBuilder builder)
    {
        builder.Services.Configure<DemoDataOptions>(
            builder.Configuration.GetSection(DemoDataOptions.SectionName));
        builder.Services.AddScoped<DemoDataSeeder>();
    }
}