using Microsoft.EntityFrameworkCore;
using SteadySteps.BLL.ServiceImplementations;
using SteadySteps.BLL.ServiceInterfaces;
using SteadySteps.DAL.Data;

namespace SteadySteps.PL
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
                    options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
                });
            builder.Services.AddDbContext<SteadyStepsDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Register the IUserService and its implementation
            builder.Services.AddScoped<IUserService, UserService>();

            // Register other services
            builder.Services.AddScoped<IHabitService, HabitService>();
            builder.Services.AddScoped<IGoalService, GoalService>();
            builder.Services.AddScoped<IHabitLogService, HabitLogService>();

            // Add other necessary services
            builder.Services.AddAuthorization();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();
            app.MapControllers();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.Run();
        }
    }
}