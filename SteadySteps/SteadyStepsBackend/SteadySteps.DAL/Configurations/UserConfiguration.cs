using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SteadySteps.DAL.Models;

namespace SteadySteps.DAL.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.Property(u => u.RegisterDate)
                .HasColumnType("timestamp with time zone");

            builder.Property(u => u.LastLogin)
                .HasColumnType("timestamp with time zone");
        }
    }
}