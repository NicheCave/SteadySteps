using AutoMapper;
using SteadySteps.BLL.Models.ViewDTO;
using SteadySteps.BLL.Models.InputDTO;
using SteadySteps.BLL.Models.UserDTO;
using SteadySteps.DAL.Models;

namespace SteadySteps.BLL;

internal class Mappings : Profile
{
    public Mappings()
    {
        CreateMap<User, UserVm>();
        CreateMap<UserIm, User>();
        
        CreateMap<Habit, HabitVM>();
        CreateMap<HabitVM, Habit>();
        
        CreateMap<Goal, GoalVm>();
        CreateMap<GoalVm, Goal>();
        CreateMap<GoalIm, Goal>();
        
        CreateMap<HabitLog, HabitLogVm>();
        CreateMap<HabitLogVm, HabitLog>();
        CreateMap<HabitLogIm, HabitLog>();
    }
}