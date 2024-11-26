using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using SteadySteps.DAL.Configurations;
using SteadySteps.DAL.Models;

namespace SteadySteps.DAL.Data;

public partial class SteadyStepsDbContext : DbContext
{
    public SteadyStepsDbContext()
    {
    }

    public SteadyStepsDbContext(DbContextOptions<SteadyStepsDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AuthToken> AuthTokens { get; set; }

    public virtual DbSet<Goal> Goals { get; set; }

    public virtual DbSet<Habit> Habits { get; set; }

    public virtual DbSet<HabitLog> HabitLogs { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseNpgsql("Host=localhost;Database=SteadySteps;Username=postgres;Password=postgres");
        }
    }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfiguration(new UserConfiguration());
    }
}