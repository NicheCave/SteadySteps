using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
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
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=SteadySteps;Username=Postgres;Password=20061979");
}