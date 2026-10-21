using Microsoft.Extensions.DependencyInjection;
using SteadySteps.BLL.Services.Interfaces;
using SteadySteps.BLL.Services.Implementations;

namespace SteadySteps.BLL;

public static class ServiceExtensions
{
    public static void AddServices(this IServiceCollection services)
    {
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddScoped<IHabitService, HabitService>();
        services.AddScoped<IGoalService, GoalService>();
        services.AddScoped<IHabitLogService, HabitLogService>();
    }

    public static void AddAutoMapper(this IServiceCollection services)
    {
        services.AddAutoMapper(_ => { }, typeof(Mappings));
    }
}