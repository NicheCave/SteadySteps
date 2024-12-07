using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SteadySteps.DAL.Configurations;
using SteadySteps.DAL.Models;

namespace SteadySteps.DAL.Data;

public partial class SteadyStepsDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public SteadyStepsDbContext()
    {
    }

    public SteadyStepsDbContext(DbContextOptions<SteadyStepsDbContext> options)
        : base(options)
    {
    }
    
    public virtual DbSet<Goal> Goals { get; set; }
    public virtual DbSet<Habit> Habits { get; set; }
    public virtual DbSet<HabitLog> HabitLogs { get; set; }
    public new virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfiguration(new UserConfiguration());

        modelBuilder.Entity<HabitLog>()
            .HasOne(hl => hl.Habit)
            .WithMany(h => h.HabitLogs)
            .HasForeignKey(hl => hl.HabitId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}